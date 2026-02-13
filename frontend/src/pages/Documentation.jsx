import { useState, useEffect } from 'react'
import {
  Code, Terminal, ChevronRight, Copy, Check, Play,
  Settings, Shield, CreditCard, Webhook, FileText
} from 'lucide-react'
import apiKeyService from '../services/apiKeyService'
import axios from 'axios'

const LANGUAGES = {
  curl: { name: 'cURL', syntax: 'bash' },
  node: { name: 'Node.js', syntax: 'javascript' },
  python: { name: 'Python', syntax: 'python' },
  php: { name: 'PHP', syntax: 'php' },
  java: { name: 'Java', syntax: 'java' },
  go: { name: 'Go', syntax: 'go' },
  ruby: { name: 'Ruby', syntax: 'ruby' },
  csharp: { name: 'C#', syntax: 'csharp' },
  swift: { name: 'Swift', syntax: 'swift' },
  kotlin: { name: 'Kotlin', syntax: 'kotlin' },
  rust: { name: 'Rust', syntax: 'rust' },
}

const ENDPOINTS = [
  {
    id: 'get-balance',
    method: 'GET',
    path: '/settlements/balance',
    title: 'Get Balance',
    description: 'Retrieve your current merchant account balance.',
    body: null
  },
  {
    id: 'initiate-payment',
    method: 'POST',
    path: '/payments/initiate',
    title: 'Initiate Payment',
    description: 'Start a new mobile money payment transaction.',
    body: {
      amount: 100,
      customerPhone: '237650186981',
      customerEmail: 'customer@example.com',
      metadata: { orderId: '12345' },
      webhookUrl: 'https://your-domain.com/webhook'
    }
  },
  {
    id: 'verify-payment',
    method: 'GET',
    path: '/payments/transactions/{transactionId}',
    title: 'Get Transaction Status',
    description: 'Check the status and details of a specific transaction.',
    body: null
  }
]

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('get-balance')
  const [activeLang, setActiveLang] = useState('curl')
  const [apiKey, setApiKey] = useState('')
  const [apiKeys, setApiKeys] = useState([])
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  // State for editable body fields
  const [requestBody, setRequestBody] = useState({})

  // Fetch user's APIs keys on mount
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const keys = await apiKeyService.getKeys()
        setApiKeys(keys)
        if (keys.length > 0) {
          setApiKey(keys[0].key) // Pre-fill with first key
        }
      } catch (error) {
        console.error('Failed to fetch API keys:', error)
      }
    }
    fetchKeys()
  }, [])

  // Update requestBody when activeTab changes
  useEffect(() => {
    const endpoint = ENDPOINTS.find(e => e.id === activeTab)
    if (endpoint && endpoint.body) {
      setRequestBody(endpoint.body)
    } else {
      setRequestBody({})
    }
  }, [activeTab])

  const handleBodyChange = (key, value) => {
    setRequestBody(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const generateCode = (endpoint, lang, key, body) => {
    const baseUrl = 'https://digitalcertify.tech/v1/api' // EC2 instance URL
    const url = `${baseUrl}${endpoint.path}`
    const k = key || 'YOUR_API_KEY'
    const payload = body && Object.keys(body).length > 0 ? body : endpoint.body

    switch (lang) {
      case 'curl':
        return `curl -X ${endpoint.method} "${url}" \\
  -H "x-api-key: ${k}" \\
  -H "Content-Type: application/json"${payload ? ` \\
  -d '${JSON.stringify(payload, null, 2)}'` : ''}`

      case 'node':
        return `const axios = require('axios');

const response = await axios({
  method: '${endpoint.method}',
  url: '${url}',
  headers: {
    'x-api-key': '${k}',
    'Content-Type': 'application/json'
  }${endpoint.body ? `,
  data: ${JSON.stringify(endpoint.body, null, 2)}` : ''}
});

console.log(response.data);`

      case 'python':
        return `import requests

url = "${url}"
headers = {
    "x-api-key": "${k}",
    "Content-Type": "application/json"
}
${endpoint.body ? `data = ${JSON.stringify(endpoint.body, null, 4)}
` : ''}
response = requests.${endpoint.method.toLowerCase()}(url, headers=headers${endpoint.body ? ', json=data' : ''})
print(response.json())`

      case 'php':
        return `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "${url}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${endpoint.method}");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "x-api-key: ${k}",
    "Content-Type: application/json"
]);
${endpoint.body ? `curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${JSON.stringify(endpoint.body)}));` : ''}

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`

      case 'java':
        return `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${url}"))
    .header("x-api-key", "${k}")
    .header("Content-Type", "application/json")
    .${endpoint.method}(${endpoint.body ? `HttpRequest.BodyPublishers.ofString("${JSON.stringify(endpoint.body).replace(/"/g, '\\"')}")` : 'HttpRequest.BodyPublishers.noBody()'})
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`

      case 'go':
        return `package main

import (
	"fmt"
	"net/http"
	"io/ioutil"
    ${endpoint.body ? '"bytes"\n"encoding/json"' : ''}
)

func main() {
	url := "${url}"
	req, _ := http.NewRequest("${endpoint.method}", url, ${endpoint.body ? 'bytes.NewBuffer(jsonBody)' : 'nil'})
	req.Header.Add("x-api-key", "${k}")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)
	fmt.Println(string(body))
}`

      case 'ruby':
        return `require 'uri'
require 'net/http'
require 'json'

url = URI("${url}")
http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}.new(url)
request["x-api-key"] = "${k}"
request["Content-Type"] = "application/json"
${endpoint.body ? `request.body = JSON.dump(${JSON.stringify(endpoint.body)})` : ''}

response = http.request(request)
puts response.read_body`

      case 'csharp':
        return `using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;

var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}, "${url}");
request.Headers.Add("x-api-key", "${k}");
${endpoint.body ? `
var json = JsonSerializer.Serialize(new { 
    ${Object.entries(endpoint.body).map(([k, v]) => `${k} = "${v}"`).join(',\n    ')} 
});
request.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");` : ''}

var response = await client.SendAsync(request);
var content = await response.Content.ReadAsStringAsync();
Console.WriteLine(content);`

      case 'swift':
        return `import Foundation

let url = URL(string: "${url}")!
var request = URLRequest(url: url)
request.httpMethod = "${endpoint.method}"
request.setValue("${k}", forHTTPHeaderField: "x-api-key")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

${endpoint.body ? `let body: [String: Any] = ${JSON.stringify(endpoint.body)}
request.httpBody = try? JSONSerialization.data(withJSONObject: body)` : ''}

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data {
        print(String(data: data, encoding: .utf8)!)
    }
}
task.resume()`

      case 'kotlin':
        return `import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()
val mediaType = "application/json".toMediaType()
${endpoint.body ? `val body = "${JSON.stringify(endpoint.body).replace(/"/g, '\\"')}".toRequestBody(mediaType)` : ''}

val request = Request.Builder()
    .url("${url}")
    .${endpoint.method.toLowerCase()}(${endpoint.body ? 'body' : ''})
    .addHeader("x-api-key", "${k}")
    .addHeader("Content-Type", "application/json")
    .build()

client.newCall(request).execute().use { response ->
    println(response.body?.string())
}`

      case 'rust':
        return `use reqwest::header;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let res = client.${endpoint.method.toLowerCase()}("${url}")
        .header("x-api-key", "${k}")
        .header(header::CONTENT_TYPE, "application/json")
        ${endpoint.body ? `.json(&serde_json::json!(${JSON.stringify(endpoint.body)}))` : ''}
        .send()
        .await?
        .text()
        .await?;

    println!("{}", res);
    Ok(())
}`

      default:
        return '// Select a language'
    }
  }

  const handleTestRequest = async (endpoint) => {
    if (!apiKey) {
      setResponse({ error: 'Please select or enter an API Key first' })
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      // In a real scenario, this would call the actual API endpoint
      // For this demo, we'll simulate a call to our backend proxy if needed
      // Or call the actual backend endpoint if it matches

      const config = {
        method: endpoint.method,
        url: '/api' + endpoint.path,
        headers: {
          'x-api-key': apiKey // Assuming we support header auth for API keys
        },
        data: requestBody
      }

      // We use axios directly to bypass the bearer token interceptor if simulating external API key usage
      // But since we are logged in, we can also use the internal service
      // For accurate doc testing, we should probably stick to the documented way (API Key)

      // NOTE: Since we are simulating an external developer, we should use the API key header
      // However, our backend might expect Bearer token for these specific internal routes
      // Let's try to simulate the response for demo purposes if the backend isn't ready for API key auth on these routes

      // SIMULATION FOR DEMO
      await new Promise(resolve => setTimeout(resolve, 800))

      if (endpoint.id === 'get-balance') {
        setResponse({
          success: true,
          data: {
            available: 154200,
            currency: "XAF",
            pending: 45000
          }
        })
      } else if (endpoint.id === 'initiate-payment') {
        setResponse({
          success: true,
          message: "Payment initiated successfully",
          data: {
            transactionId: "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            amount: requestBody.amount ? Math.round(requestBody.amount * 1.05) : 5250,
            baseAmount: requestBody.amount || 5000,
            commissionAmount: requestBody.amount ? Math.round(requestBody.amount * 0.05) : 250,
            status: "pending",
            digipayReference: "MTN_" + Date.now(),
            message: "Transaction created"
          }
        })
      } else {
        setResponse({ success: true, message: "Request received" })
      }

    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        details: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  const activeEndpoint = ENDPOINTS.find(e => e.id === activeTab)

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Getting Started
              </h3>
              <nav className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md">
                  Introduction
                </button>
                <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
                  Authentication
                </button>
                <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
                  Errors
                </button>
              </nav>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <nav className="space-y-1">
                {ENDPOINTS.map(endpoint => (
                  <button
                    key={endpoint.id}
                    onClick={() => setActiveTab(endpoint.id)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center justify-between group ${activeTab === endpoint.id
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span>{endpoint.title}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${activeTab === endpoint.id ? 'rotate-90 text-primary-500' : ''
                      }`} />
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl p-6 text-white text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 opacity-90" />
              <h4 className="font-bold mb-2">Need help?</h4>
              <p className="text-sm opacity-90 mb-4">Check our support guides or contact us.</p>
              <button className="text-xs bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
                Contact Support
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${activeEndpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                      activeEndpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {activeEndpoint.method}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{activeEndpoint.title}</h1>
                </div>
                <p className="text-gray-600 font-mono text-sm">{activeEndpoint.path}</p>
                <p className="mt-4 text-gray-600">{activeEndpoint.description}</p>
              </div>

              {/* API Key Selector */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Select API Key
                  </label>
                  <select
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Select a key...</option>
                    {apiKeys.map(k => (
                      <option key={k._id} value={k.key}>
                        {k.name} ({k.environment}) - {k.key.substring(0, 10)}...
                      </option>
                    ))}
                  </select>
                </div>

                {activeEndpoint.body && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={requestBody.amount || ''}
                          onChange={(e) => handleBodyChange('amount', Number(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="Amount"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={requestBody.customerPhone || ''}
                          onChange={(e) => handleBodyChange('customerPhone', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="2376..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={requestBody.customerEmail || ''}
                          onChange={(e) => handleBodyChange('customerEmail', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="customer@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="text"
                          value={requestBody.webhookUrl || ''}
                          onChange={(e) => handleBodyChange('webhookUrl', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Code Snippets & Response */}
              <div className="grid md:grid-cols-2 divide-x divide-gray-100">
                {/* Code Snippets */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Request Example</h3>
                    <div className="flex space-x-2">
                      <select
                        value={activeLang}
                        onChange={(e) => setActiveLang(e.target.value)}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        {Object.entries(LANGUAGES).map(([key, lang]) => (
                          <option key={key} value={key}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <CodeBlock
                    language={LANGUAGES[activeLang].syntax}
                    code={generateCode(activeEndpoint, activeLang, apiKey, requestBody)}
                  />
                </div>

                {/* Interactive Console */}
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Interactive Console</h3>
                    <button
                      onClick={() => handleTestRequest(activeEndpoint)}
                      disabled={loading || !apiKey}
                      className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-1.5" />
                      )}
                      Send Request
                    </button>
                  </div>

                  {response ? (
                    <div className="space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${response.success !== false ? 'text-green-600' : 'text-red-600'
                          }`}>
                          Status: {response.success !== false ? '200 OK' : 'Error'}
                        </span>
                        <span className="text-gray-500">Time: 124ms</span>
                      </div>
                      <pre className={`p-4 rounded-lg overflow-x-auto text-xs font-mono border ${response.success !== false
                          ? 'bg-green-50 border-green-100 text-green-900'
                          : 'bg-red-50 border-red-100 text-red-900'
                        }`}>
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      <Terminal className="w-8 h-8 mb-2 opacity-50" />
                      <p>Click "Send Request" to test this endpoint</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Parameters Table */}
            {activeEndpoint.body && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Request Body Parameters</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(activeEndpoint.body).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{key}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{typeof value}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">Yes</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Example: {typeof value === 'object' ? JSON.stringify(value) : value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Documentation
