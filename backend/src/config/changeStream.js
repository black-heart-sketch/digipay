/**
 * Throttling utility to limit emission rate
 * @param {Function} func - Function to throttle
 * @param {Number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, delay) {
  let lastCall = 0;
  let timeout;
  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);
    if (remaining <= 0) {
      clearTimeout(timeout);
      lastCall = now;
      func(...args);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, remaining);
    }
  };
}

const throttledEmitters = {};
const throttleLimit = 1000; // 1 second throttle

/**
 * Get or create throttled emitter for a channel
 * @param {Object} io - Socket.IO server instance
 * @param {String} channel - Channel name
 * @returns {Function} Throttled emitter
 */
function getThrottledEmitter(io, channel) {
  if (!throttledEmitters[channel]) {
    throttledEmitters[channel] = throttle((change) => {
      io.emit(channel, change);
    }, throttleLimit);
  }
  return throttledEmitters[channel];
}

/**
 * Watch MongoDB changes with retry logic
 * @param {Object} mongoose - Mongoose instance
 * @param {Object} io - Socket.IO server instance
 */
const watchChanges = (mongoose, io) => {
  const db = mongoose.connection.db;
  
  if (!db) {
    console.error('❌ Database not connected. Cannot start change stream.');
    return;
  }

  const pipeline = [
    { 
      $match: { 
        operationType: { $in: ['insert', 'update', 'delete'] } 
      } 
    },
  ];

  let changeStream;

  try {
    changeStream = db.watch(pipeline);
    console.log('✅ Started watching for database changes...');
  } catch (error) {
    console.error('❌ Error creating change stream:', error.message);
    // Retry after 5 seconds
    setTimeout(() => {
      console.log('🔄 Retrying change stream connection...');
      watchChanges(mongoose, io);
    }, 5000);
    return;
  }

  changeStream.on('change', (change) => {
    const collectionName = change.ns?.coll;
    
    if (collectionName) {
      // Emit to specific collection channel
      getThrottledEmitter(io, collectionName)(change);
      console.log(`📡 Change detected in ${collectionName}:`, change.operationType);
    } else {
      // Emit to general channel if collection name not available
      io.emit('general', change);
    }
  });

  changeStream.on('error', (error) => {
    console.error('❌ Change Stream error:', error.message);
    
    // Close and retry
    try {
      changeStream.close();
    } catch (closeError) {
      console.error('❌ Error closing change stream:', closeError.message);
    }
    
    setTimeout(() => {
      console.log('🔄 Restarting Change Stream...');
      watchChanges(mongoose, io);
    }, 5000); // Retry after 5 seconds
  });

  changeStream.on('close', () => {
    console.warn('⚠️ Change Stream closed. Reopening...');
    setTimeout(() => {
      watchChanges(mongoose, io);
    }, 5000); // Retry after 5 seconds
  });
};

module.exports = watchChanges;
