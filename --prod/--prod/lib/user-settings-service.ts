// Server-side imports moved to server-only functions to avoid fs module in client

export interface AISettings {
  auto_processing: {
    enabled: boolean
    confidence_threshold: number
    categories: string[]
    auto_tags: boolean
    smart_descriptions: boolean
  }
  bulk_uploader: {
    batch_size: number
    retry_attempts: number
    timeout_seconds: number
  }
  recommendations: {
    suggestionsPerRefresh: 1|2|3|4|5|6|7|8|9|10
    serendipityLevel: 0|1|2|3|4|5|6|7|8|9|10
    autoIncludeOnSelect: boolean
    autoBundle: boolean
    includeTLDR: boolean
    domainBlacklist: string[]
    revisitNudgeDays: 1|3|7|14|21|30
    includeTrending: boolean
  }
  link_finder: {
    enabled: boolean
    confidence_threshold: number
    categories: string[]
    auto_tags: boolean
    smart_descriptions: boolean
    topic: string
    useProfileInterests: boolean
    dateRange: string
    linkTypes: string[]
    maxResults: number
    includeMetadata: boolean
    filterDuplicates: boolean
  }
  link_validator: {
    check_frequency: 'off' | 'daily' | 'weekly' | 'monthly'
    auto_remove_broken: boolean
    notify_on_broken: boolean
  }
  browser_launcher: {
    duplicateHandling: 'skip' | 'overwrite' | 'keepBoth';
    maxTabs: number;
    autoTag: boolean;
    autoCategorize: boolean;
    undoWindowSecs: number;
  }
}

export interface OracleSettings {
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    size: 'small' | 'medium' | 'large'
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    opacity: number
    blur_background: boolean
    show_animations: boolean
    primaryColor: string
    secondaryColor: string
    gradientDirection: 'linear' | 'radial' | 'conic'
    gradientIntensity: number
    blobSize: number
    blobFluidness: number
    blobRoundness: number
    morphingSpeed: number
    voiceVisualization: boolean
    voiceBarsCount: number
    voiceBarsHeight: number
    voiceBarsSpacing: number
    voiceReactivity: number
    idleAnimation: boolean
    idleAnimationSpeed: number
    pulseEffect: boolean
    pulseIntensity: number
    glowEffect: boolean
    glowIntensity: number
    floatingBehavior: boolean
    floatingRange: number
    rotationEffect: boolean
    rotationSpeed: number
    blobOpacity: number
    backgroundBlur: number
    adaptToSystemTheme: boolean
    darkModeAdjustment: number
  }
  behavior: {
    auto_minimize: boolean
    stay_on_top: boolean
    click_through: boolean
    smart_responses: boolean
    personality: 'professional' | 'friendly' | 'casual' | 'creative' | 'analytical'
    responseStyle: 'concise' | 'detailed' | 'balanced'
    creativity: number
    temperature: number
    maxTokens: number
    contextWindow: number
    enableEmoji: boolean
    enableHumor: boolean
    enableExplanations: boolean
    proactiveMode: boolean
    suggestFollowUps: boolean
    rememberPreferences: boolean
    adaptToUser: boolean
    responseDelay: number
    typingIndicator: boolean
    customInstructions: string
    safetyLevel: 'strict' | 'moderate' | 'permissive'
    languageStyle: 'formal' | 'conversational' | 'technical'
    errorHandling: 'apologetic' | 'direct' | 'helpful'
  }
  voice: {
    enabled: boolean
    voice_id: string
    speed: number
    pitch: number
    volume: number
    voiceModel: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
    language: string
    audioQuality: 'high' | 'medium' | 'low'
    responseFormat: 'mp3' | 'opus' | 'aac' | 'flac'
    enableSpeechToText: boolean
    autoPlayResponses: boolean
    voiceCloning: boolean
    emotionalTone: boolean
    backgroundNoise: boolean
    echoCancellation: boolean
  }
  context: {
    remember_conversations: boolean
    context_window_size: number
    personality: 'professional' | 'friendly' | 'casual' | 'technical'
    memoryCategories: string[]
    maxMemoryItems: number
    autoSummarize: boolean
    contextPriority: 'recent' | 'relevant' | 'mixed'
    crossSessionMemory: boolean
    memoryRetentionDays: number
  }
  tools: {
    web_search: boolean
    code_execution: boolean
    file_operations: boolean
    system_integration: boolean
    allowedDomains: string[]
    blockedDomains: string[]
    apiKeys: { [key: string]: string }
    rateLimits: { [key: string]: number }
    securityLevel: 'basic' | 'standard' | 'strict'
    sandboxMode: boolean
    logToolUsage: boolean
  }
  advanced: {
    model: string
    temperature: number
    max_tokens: number
    custom_instructions: string
    debugMode: boolean
    developerMode: boolean
    experimentalFeatures: boolean
    betaFeatures: boolean
    telemetryEnabled: boolean
    crashReporting: boolean
    performanceMonitoring: boolean
    memoryOptimization: boolean
    cacheEnabled: boolean
    cacheSize: number
    logLevel: 'error' | 'warn' | 'info' | 'debug' | 'verbose'
    maxLogSize: number
    autoBackup: boolean
    backupInterval: number
    encryptionEnabled: boolean
    securityLevel: 'basic' | 'standard' | 'high' | 'paranoid'
    rateLimiting: boolean
    maxRequestsPerMinute: number
    customPrompts: { [key: string]: string }
    systemPrompts: string
    modelParameters: {
      temperature: number
      topP: number
      topK: number
      repetitionPenalty: number
      maxTokens: number
      presencePenalty: number
      frequencyPenalty: number
    }
    advancedLogging: boolean
    networkTimeout: number
    retryAttempts: number
    fallbackModel: string
    customEndpoints: { [key: string]: string }
    resourceLimits: {
      maxMemoryUsage: number
      maxCpuUsage: number
      maxDiskUsage: number
    }
  }
}

// Client-safe functions that call API routes instead of direct storage
export async function getAISetting<K extends keyof AISettings>(
  userId: string,
  key: K
): Promise<AISettings[K]> {
  try {
    const response = await fetch(`/api/settings/ai/${key}?user_id=${userId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch setting: ${response.statusText}`)
    }
    const data = await response.json()
    return data.value
  } catch (error) {
    console.warn(`Failed to fetch AI setting ${key}:`, error)
    // Return sensible defaults
    return getDefaultAISetting(key)
  }
}

export async function saveAISetting<K extends keyof AISettings>(
  userId: string,
  key: K,
  value: AISettings[K]
): Promise<void> {
  const response = await fetch(`/api/settings/ai/${key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, value }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save setting: ${response.statusText}`)
  }
}

export async function getOracleSetting<K extends keyof OracleSettings>(
  userId: string,
  key: K
): Promise<OracleSettings[K]> {
  try {
    const response = await fetch(`/api/settings/oracle/${key}?user_id=${userId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch setting: ${response.statusText}`)
    }
    const data = await response.json()
    return data.value
  } catch (error) {
    console.warn(`Failed to fetch Oracle setting ${key}:`, error)
    // Return sensible defaults
    return getDefaultOracleSetting(key)
  }
}

export async function saveOracleSetting<K extends keyof OracleSettings>(
  userId: string,
  key: K,
  value: OracleSettings[K]
): Promise<void> {
  const response = await fetch(`/api/settings/oracle/${key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, value }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save setting: ${response.statusText}`)
  }
}

// Default settings functions
function getDefaultAISetting<K extends keyof AISettings>(key: K): AISettings[K] {
  const defaults: AISettings = {
    auto_processing: {
      enabled: false,
      confidence_threshold: 0.8,
      categories: ['Development', 'Design', 'Marketing'],
      auto_tags: true,
      smart_descriptions: true,
    },
    bulk_uploader: {
      batch_size: 10,
      retry_attempts: 3,
      timeout_seconds: 30,
    },
    recommendations: {
      suggestionsPerRefresh: 5,
      serendipityLevel: 3,
      autoIncludeOnSelect: true,
      autoBundle: false,
      includeTLDR: true,
      domainBlacklist: [],
      revisitNudgeDays: 14,
      includeTrending: false,
    },
    link_finder: {
      enabled: false,
      confidence_threshold: 0.8,
      categories: ['Development', 'Design', 'Marketing'],
      auto_tags: true,
      smart_descriptions: true,
      topic: '',
      useProfileInterests: true,
      dateRange: 'week',
      linkTypes: ['article', 'video', 'tool'],
      maxResults: 20,
      includeMetadata: true,
      filterDuplicates: true,
    },
    link_validator: {
      check_frequency: 'weekly',
      auto_remove_broken: false,
      notify_on_broken: true,
    },
    browser_launcher: {
      duplicateHandling: 'skip',
      maxTabs: 40,
      autoTag: true,
      autoCategorize: true,
      undoWindowSecs: 8,
    },
  }
  return defaults[key]
}

function getDefaultOracleSetting<K extends keyof OracleSettings>(key: K): OracleSettings[K] {
  const defaults: OracleSettings = {
    appearance: {
      theme: 'auto',
      size: 'medium',
      position: 'bottom-right',
      opacity: 0.9,
      blur_background: true,
      show_animations: true,
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      gradientDirection: 'linear',
      gradientIntensity: 80,
      blobSize: 60,
      blobFluidness: 60,
      blobRoundness: 75,
      morphingSpeed: 50,
      voiceVisualization: true,
      voiceBarsCount: 6,
      voiceBarsHeight: 30,
      voiceBarsSpacing: 3,
      voiceReactivity: 80,
      idleAnimation: true,
      idleAnimationSpeed: 30,
      pulseEffect: true,
      pulseIntensity: 20,
      glowEffect: true,
      glowIntensity: 50,
      floatingBehavior: true,
      floatingRange: 10,
      rotationEffect: false,
      rotationSpeed: 20,
      blobOpacity: 85,
      backgroundBlur: 2,
      adaptToSystemTheme: true,
      darkModeAdjustment: 15,
    },
    behavior: {
      auto_minimize: false,
      stay_on_top: true,
      click_through: false,
      smart_responses: true,
      personality: 'friendly',
      responseStyle: 'balanced',
      creativity: 70,
      temperature: 0.7,
      maxTokens: 1000,
      contextWindow: 4000,
      enableEmoji: true,
      enableHumor: false,
      enableExplanations: true,
      proactiveMode: false,
      suggestFollowUps: true,
      rememberPreferences: true,
      adaptToUser: true,
      responseDelay: 500,
      typingIndicator: true,
      customInstructions: '',
      safetyLevel: 'moderate',
      languageStyle: 'conversational',
      errorHandling: 'helpful',
    },
    voice: {
      enabled: true,
      voice_id: 'alloy',
      speed: 1.0,
      pitch: 1.0,
      volume: 0.8,
      voiceModel: 'alloy',
      language: 'en-US',
      audioQuality: 'high',
      responseFormat: 'mp3',
      enableSpeechToText: false,
      autoPlayResponses: false,
      voiceCloning: false,
      emotionalTone: false,
      backgroundNoise: false,
      echoCancellation: true,
    },
    context: {
      remember_conversations: true,
      context_window_size: 4000,
      personality: 'friendly',
      memoryCategories: ['general', 'preferences', 'tasks'],
      maxMemoryItems: 100,
      autoSummarize: true,
      contextPriority: 'mixed',
      crossSessionMemory: true,
      memoryRetentionDays: 30,
    },
    tools: {
      web_search: true,
      code_execution: false,
      file_operations: false,
      system_integration: false,
      allowedDomains: [],
      blockedDomains: [],
      apiKeys: {},
      rateLimits: {},
      securityLevel: 'standard',
      sandboxMode: true,
      logToolUsage: true,
    },
    advanced: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1000,
      custom_instructions: '',
      debugMode: false,
      developerMode: false,
      experimentalFeatures: false,
      betaFeatures: false,
      telemetryEnabled: true,
      crashReporting: true,
      performanceMonitoring: true,
      memoryOptimization: true,
      cacheEnabled: true,
      cacheSize: 100,
      logLevel: 'info',
      maxLogSize: 10,
      autoBackup: true,
      backupInterval: 24,
      encryptionEnabled: true,
      securityLevel: 'standard',
      rateLimiting: true,
      maxRequestsPerMinute: 60,
      customPrompts: {},
      systemPrompts: '',
      modelParameters: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repetitionPenalty: 1.1,
        maxTokens: 1000,
        presencePenalty: 0.0,
        frequencyPenalty: 0.0,
      },
      advancedLogging: false,
      networkTimeout: 30000,
      retryAttempts: 3,
      fallbackModel: 'gpt-3.5-turbo',
      customEndpoints: {},
      resourceLimits: {
        maxMemoryUsage: 512,
        maxCpuUsage: 80,
        maxDiskUsage: 1024,
      },
    },
  }
  return defaults[key]
}

// Server-side functions (for API routes) - these can use the storage service directly
// Server-side functions moved to user-settings-server.ts to avoid fs module import in client                