import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Code, Terminal, ChevronRight, Copy, Check, Play,
  Settings, Shield, CreditCard, Webhook, FileText,
  Coins, ArrowRight, BookOpen, Layers, Zap, Globe
} from 'lucide-react'

const LANGUAGES = {
  curl: { name: 'cURL', syntax: 'bash', icon: '🐚' },
  node: { name: 'Node.js', syntax: 'javascript', icon: '🟢' },
  python: { name: 'Python', syntax: 'python', icon: '🐍' },
  php: { name: 'PHP', syntax: 'php', icon: '🐘' },
  java: { name: 'Java', syntax: 'java', icon: '☕' },
  go: { name: 'Go', syntax: 'go', icon: '🐹' },
  ruby: { name: 'Ruby', syntax: 'ruby', icon: '💎' },
  csharp: { name: 'C#', syntax: 'csharp', icon: '#️⃣' },
  swift: { name: 'Swift', syntax: 'swift', icon: '🐦' },
  kotlin: { name: 'Kotlin', syntax: 'kotlin', icon: '🤖' },
  rust: { name: 'Rust', syntax: 'rust', icon: '🦀' },
  dart: { name: 'Dart', syntax: 'dart', icon: '🎯' },
  r: { name: 'R', syntax: 'r', icon: '📈' },
  scala: { name: 'Scala', syntax: 'scala', icon: '🔴' },
  perl: { name: 'Perl', syntax: 'perl', icon: '🐪' },
  lua: { name: 'Lua', syntax: 'lua', icon: '🌙' },
  elixir: { name: 'Elixir', syntax: 'elixir', icon: '💧' },
}

const SDK_INSTALLATIONS = [
  { lang: 'Node.js', icon: '🟢', cmd: 'npm install digipay-sdk', package: 'digipay-sdk' },
  { lang: 'Python', icon: '🐍', cmd: 'pip install digipay-python', package: 'digipay-python' },
  { lang: 'PHP', icon: '🐘', cmd: 'composer require digipay/digipay-php', package: 'digipay/digipay-php' },
  { lang: 'Java', icon: '☕', cmd: 'implementation \'com.digipay:digipay-java:1.0.0\'', package: 'com.digipay:digipay-java' },
  { lang: 'Go', icon: '🐹', cmd: 'go get github.com/digipay/digipay-go', package: 'github.com/digipay/digipay-go' },
  { lang: 'Ruby', icon: '💎', cmd: 'gem install digipay', package: 'digipay' },
  { lang: 'C#', icon: '#️⃣', cmd: 'dotnet add package DigiPay.SDK', package: 'DigiPay.SDK' },
  { lang: 'Swift', icon: '🐦', cmd: '.package(url: "https://github.com/digipay/digipay-swift")', package: 'digipay-swift' },
  { lang: 'Kotlin', icon: '🤖', cmd: 'implementation("com.digipay:digipay-kotlin:1.0.0")', package: 'com.digipay:digipay-kotlin' },
  { lang: 'Rust', icon: '🦀', cmd: 'cargo add digipay', package: 'digipay' },
  { lang: 'Dart', icon: '🎯', cmd: 'flutter pub add digipay', package: 'digipay' },
  { lang: 'Elixir', icon: '💧', cmd: '{:digipay, "~> 1.0"}', package: 'digipay' },
]

const SDKCard = ({ lang, icon, cmd, package: pkg }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-primary-500 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">{lang}</h4>
            <p className="text-xs text-gray-500 font-mono">{pkg}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-colors"
          title="Copy installation command"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-100 overflow-x-auto">
        {cmd}
      </div>
    </div>
  )
}

const ENDPOINTS = [
  {
    id: 'intro',
    title: 'Introduction',
    description: 'Welcome to the DigiPay API. Our API allows you to accept mobile money payments, check transaction status, and manage your account programmatically.',
    type: 'guide'
  },
  {
    id: 'sdks',
    title: 'SDKs & Libraries',
    description: 'Official libraries to integrate DigiPay into your application.',
    type: 'guide',
    isSDKSection: true
  },
  {
    id: 'quickstart',
    title: 'Quickstart',
    description: 'Get your first payment up and running in minutes.',
    type: 'guide',
    content: `
### 1. Initialize the Client
First, import the library and initialize it with your API key.

**Node.js**
\`\`\`javascript
const DigiPay = require('@digipay/sdk');

const client = new DigiPay({
  apiKey: 'YOUR_API_KEY',
  environment: 'production' // or 'sandbox'
});
\`\`\`

### 2. Create a Payment
Now you can request a payment from a mobile money user.

\`\`\`javascript
try {
  const payment = await client.payments.create({
    amount: 5000,
    currency: 'XAF',
    customer: {
      phone: '237699000000',
      email: 'customer@email.com'
    },
    metadata: {
      order_id: 'ORDER_123'
    }
  });

  console.log('Payment started:', payment.id);
} catch (error) {
  console.error('Payment failed:', error);
}
\`\`\`
    `
  },
  {
    id: 'auth',
    title: 'Authentication',
    description: 'Authenticate your requests using API Keys. You can manage your keys in the dashboard.',
    type: 'guide',
    content: `
All API requests must be authenticated using the \`x-api-key\` header with your API key.

\`\`\`bash
x-api-key: YOUR_API_KEY
\`\`\`

You can generate Test and Live API keys in your merchant dashboard.
    `
  },
  {
    id: 'initiate-payment',
    method: 'POST',
    path: '/payments/initiate',
    title: 'Initiate Payment',
    description: 'Start a new mobile money payment transaction.',
    type: 'endpoint',
    body: {
      amount: 5000,
      customerPhone: '2376XXXXXXXX',
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
    type: 'endpoint',
    body: null
  },
  {
    id: 'get-balance',
    method: 'GET',
    path: '/settlements/balance',
    title: 'Get Balance',
    description: 'Retrieve your current account balance and available funds.',
    type: 'endpoint',
    body: null,
    response: {
      balance: 150000,
      currency: 'XAF',
      availableBalance: 145000,
      pendingBalance: 5000,
      lastUpdated: '2024-01-15T10:30:00Z'
    }
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    description: 'Handle real-time payment updates.',
    type: 'guide',
    content: `
DigiPay sends asynchronous notifications to your webhook URL when a payment status changes.

**Payload Example:**
\`\`\`json
{
  "event": "payment.success",
  "data": {
    "transactionId": "TXN_123456",
    "freemopayReference": "MTN_987654",
    "amount": 5000,
    "status": "success",
    "metadata": { "orderId": "12345" }
  }
}
\`\`\`
    `
  }
]

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {language || 'text'}
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 bg-[#0d1117] overflow-x-auto">
        <pre className="text-sm font-mono text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

const PublicDocs = () => {
  const [activeTab, setActiveTab] = useState('intro')
  const [activeLang, setActiveLang] = useState('curl')

  const generateCode = (endpoint, lang) => {
    const baseUrl = 'https://digitalcertify.tech/v1/api'
    const url = `${baseUrl}${endpoint.path}`
    const key = 'YOUR_API_KEY'

    switch (lang) {
      case 'curl':
        return `curl -X ${endpoint.method} "${url}" \\
  -H "x-api-key: ${key}" \\
  -H "Content-Type: application/json"${endpoint.body ? ` \\
  -d '${JSON.stringify(endpoint.body, null, 2)}'` : ''}`

      case 'node':
        return `const axios = require('axios');

const response = await axios({
  method: '${endpoint.method}',
  url: '${url}',
  headers: {
    'x-api-key': '${key}',
    'Content-Type': 'application/json'
  }${endpoint.body ? `,
  data: ${JSON.stringify(endpoint.body, null, 2)}` : ''}
});

console.log(response.data);`

      case 'python':
        return `import requests

url = "${url}"
headers = {
    "x-api-key": "${key}",
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
    "x-api-key: ${key}",
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
    .header("x-api-key", "${key}")
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
	${endpoint.body ? '"bytes"\n\t"encoding/json"' : ''}
)

func main() {
	url := "${url}"
	${endpoint.body ? `
	jsonData := []byte(\`${JSON.stringify(endpoint.body)}\`)
	req, _ := http.NewRequest("${endpoint.method}", url, bytes.NewBuffer(jsonData))` : `req, _ := http.NewRequest("${endpoint.method}", url, nil)`}

	req.Header.Add("x-api-key", "${key}")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)

	fmt.Println(string(body))
}`

      case 'ruby':
        return `require 'uri'
require 'net/http'
${endpoint.body ? "require 'json'\n" : ''}
url = URI("${url}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}.new(url)
request["x-api-key"] = "${key}"
request["Content-Type"] = "application/json"
${endpoint.body ? `request.body = JSON.dump(${JSON.stringify(endpoint.body)})` : ''}

response = http.request(request)
puts response.read_body`

      case 'csharp':
        return `using System.Net.Http;
using System.Net.Http.Headers;
${endpoint.body ? 'using System.Text;\nusing System.Text.Json;' : ''}
var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}, "${url}");
request.Headers.Add("x-api-key", "${key}");
${endpoint.body ? `
var content = new StringContent(
    "${JSON.stringify(endpoint.body).replace(/"/g, '\\"')}",
    Encoding.UTF8,
    "application/json"
);
request.Content = content;` : ''}

var response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());`

      case 'swift':
        return `import Foundation

let url = URL(string: "${url}")!
var request = URLRequest(url: url)
request.httpMethod = "${endpoint.method}"
request.addValue("${key}", forHTTPHeaderField: "x-api-key")
request.addValue("application/json", forHTTPHeaderField: "Content-Type")

${endpoint.body ? `let body = ${JSON.stringify(endpoint.body)}
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
${endpoint.body ? 'import okhttp3.MediaType.Companion.toMediaType\nimport okhttp3.RequestBody.Companion.toRequestBody' : ''}

val client = OkHttpClient()

val request = Request.Builder()
  .url("${url}")
  .addHeader("x-api-key", "${key}")
  .addHeader("Content-Type", "application/json")
  ${endpoint.body ? `
  .post("""
  ${JSON.stringify(endpoint.body, null, 2)}
  """.trimIndent().toRequestBody("application/json".toMediaType()))` : `.${endpoint.method.toLowerCase()}()`}
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
        .header("x-api-key", "${key}")
        .header("Content-Type", "application/json")
        ${endpoint.body ? `.json(&serde_json::json!(${JSON.stringify(endpoint.body)}))` : ''}
        .send()
        .await?
        .text()
        .await?;

    println!("{}", res);
    Ok(())
}`

      case 'dart':
        return `import 'package:http/http.dart' as http;
${endpoint.body ? "import 'dart:convert';" : ''}

void main() async {
  var headers = {
    'x-api-key': '${key}',
    'Content-Type': 'application/json',
  };
  var request = http.Request('${endpoint.method}', Uri.parse('${url}'));
  ${endpoint.body ? `request.body = json.encode(${JSON.stringify(endpoint.body)});` : ''}
  request.headers.addAll(headers);

  http.StreamedResponse response = await request.send();

  if (response.statusCode == 200) {
    print(await response.stream.bytesToString());
  } else {
    print(response.reasonPhrase);
  }
}`

      case 'r':
        return `library(httr)

url <- "${url}"

response <- VERB("${endpoint.method}", url, 
  add_headers(
    'x-api-key' = '${key}', 
    'Content-Type' = 'application/json'
  ),
  content_type("application/json"),
  encode = "json"${endpoint.body ? `,
  body = '${JSON.stringify(endpoint.body)}'` : ''}
)

content(response, "text")`

      case 'scala':
        return `import sttp.client3._
import sttp.model.MediaType

val backend = HttpURLConnectionBackend()
val response = basicRequest
  .${endpoint.method.toLowerCase()}(uri"${url}")
  .header("x-api-key", "${key}")
  .contentType(MediaType.ApplicationJson)
  ${endpoint.body ? `.body("""${JSON.stringify(endpoint.body)}""")` : ''}
  .send(backend)

println(response.body)`

      case 'perl':
        return `use REST::Client;
${endpoint.body ? 'use JSON;' : ''}
 
my $client = REST::Client->new();
$client->addHeader('x-api-key', '${key}');
$client->addHeader('Content-Type', 'application/json');

$client->${endpoint.method}('${url}'${endpoint.body ? ", encode_json(${JSON.stringify(endpoint.body)})" : ''});
 
print $client->responseContent();`

      case 'lua':
        return `local http = require("socket.http")
local ltn12 = require("ltn12")
${endpoint.body ? 'local json = require("json")' : ''}

local response_body = {}
local headers = {
  ["x-api-key"] = "${key}",
  ["Content-Type"] = "application/json"
}

${endpoint.body ? `local body = json.encode(${JSON.stringify(endpoint.body)})
headers["Content-Length"] = string.len(body)` : ''}

local res, code, response_headers = http.request{
  url = "${url}",
  method = "${endpoint.method}",
  headers = headers,
  ${endpoint.body ? 'source = ltn12.source.string(body),' : ''}
  sink = ltn12.sink.table(response_body)
}

print(table.concat(response_body))`

      case 'elixir':
        return `HTTPoison.${endpoint.method.toLowerCase()}("${url}", 
  ${endpoint.body ? `~s(${JSON.stringify(endpoint.body)})` : '""'}, 
  [
    {"x-api-key", "${key}"}, 
    {"Content-Type", "application/json"}
  ]
)
|> case do
  {:ok, %HTTPoison.Response{body: body}} -> IO.puts(body)
  {:error, %HTTPoison.Error{reason: reason}} -> IO.inspect(reason)
end`

      default: return '// Select a language'
    }
  }

  const activeContent = ENDPOINTS.find(e => e.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Coins className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">DigiPay Docs</span>
              </Link>
              <div className="hidden md:flex ml-10 space-x-8">
                <Link to="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <div className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-primary-600">API Reference</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Log in</Link>
              <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                Get API Keys
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            DigiPay Developer API
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Integrate payments into your application with just a few lines of code.
            <br />
            <span className="text-gray-500 text-sm mt-2 block">Supported in {Object.keys(LANGUAGES).length}+ languages</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-3">Guides</h3>
              <nav className="space-y-1">
                {ENDPOINTS.filter(e => e.type === 'guide').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === item.id
                        ? 'bg-white text-primary-700 shadow-md ring-1 ring-black/5'
                        : 'text-gray-600 hover:bg-gray-200/50'
                      }`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-3">API Reference</h3>
              <nav className="space-y-1">
                {ENDPOINTS.filter(e => e.type === 'endpoint').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group flex items-center justify-between ${activeTab === item.id
                        ? 'bg-white text-primary-700 shadow-md ring-1 ring-black/5'
                        : 'text-gray-600 hover:bg-gray-200/50'
                      }`}
                  >
                    <span>{item.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${item.method === 'GET' ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200' :
                        item.method === 'POST' ? 'bg-green-100 text-green-700 group-hover:bg-green-200' : 'bg-gray-200 text-gray-700'
                      }`}>
                      {item.method}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Docs Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    {activeContent.type === 'endpoint' && (
                      <span className={`px-3 py-1 rounded-lg font-bold text-sm uppercase ${activeContent.method === 'GET' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                        }`}>
                        {activeContent.method}
                      </span>
                    )}
                    <h2 className="text-3xl font-extrabold text-gray-900">{activeContent.title}</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">{activeContent.description}</p>
                </div>

                {activeContent.type === 'guide' ? (
                  <div className="prose max-w-none text-gray-600">
                    {activeContent.isSDKSection ? (
                      <div>
                        <p className="text-gray-600 mb-8 text-lg">
                          We provide official SDKs for the most popular programming languages to help you integrate faster.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {SDK_INSTALLATIONS.map((sdk, idx) => (
                            <SDKCard key={idx} {...sdk} />
                          ))}
                        </div>
                      </div>
                    ) : activeContent.content ? (
                      <div className="whitespace-pre-wrap font-sans">
                        {activeContent.content.split('\n').map((line, i) => {
                          if (line.startsWith('```')) {
                            // Very basic parsing for guide blocks to separate title/lang
                            return null;
                          }
                          if (line.trim().startsWith('```')) {
                            // Hacky way to render code blocks in guide for now without full MD parser
                            return <div key={i} className="my-4"><CodeBlock code={line.replace(/```\w*/, '').replace(/```/, '').trim()} language="bash" /></div>;
                          }
                          if (line.trim().startsWith('###')) return <h3 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.replace('###', '')}</h3>
                          if (line.trim().startsWith('**')) return <p key={i} className="font-bold mt-2">{line.replace(/\*\*/g, '')}</p>
                          if (line.trim() === '') return <br key={i} />
                          return <p key={i}>{line}</p>
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-12">
                    {/* Endpoint URL */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Endpoint</h3>
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm shadow-sm">
                        <span className="text-gray-400 select-none">https://digitalcertify.tech/v1/api</span>
                        <span className="text-gray-900 font-semibold">{activeContent.path}</span>
                      </div>
                    </div>

                    {/* Parameters */}
                    {activeContent.body && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Request Body</h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Parameter</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description/Example</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Object.entries(activeContent.body).map(([key, value]) => (
                                <tr key={key}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">{key}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{typeof value}</td>
                                  <td className="px-6 py-4 text-sm text-gray-500">
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 text-xs">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Code Example Card */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Request Example</h3>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl bg-[#0d1117]">
                        {/* Language Tabs */}
                        <div className="flex items-center gap-1 p-2 border-b border-gray-800 overflow-x-auto no-scrollbar mask-gradient-r">
                          {Object.entries(LANGUAGES).map(([key, lang]) => (
                            <button
                              key={key}
                              onClick={() => setActiveLang(key)}
                              className={`
                                      flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                      ${activeLang === key
                                  ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/10'
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}
                                    `}
                            >
                              <span>{lang.icon}</span>
                              <span>{lang.name}</span>
                            </button>
                          ))}
                        </div>

                        {/* Code Area */}
                        <CodeBlock
                          code={generateCode(activeContent, activeLang)}
                          language={LANGUAGES[activeLang].syntax}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Coins className="w-6 h-6" />
                <span className="text-xl font-bold">DigiPay</span>
              </div>
              <p className="text-gray-400">
                Modern payment API platform built on FreemoPay
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DigiPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicDocs
