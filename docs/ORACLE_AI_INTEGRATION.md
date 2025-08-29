# Oracle AI Integration with OpenAI Whisper

## Overview

The Oracle AI system is a comprehensive voice-enabled AI assistant that integrates OpenAI Whisper for speech-to-text (STT) and OpenAI's text-to-speech (TTS) capabilities. It features an animated blob interface with voice visualization, quick actions, and a floating chat interface.

## ✨ Features

### 🎤 **Voice Integration**
- **OpenAI Whisper STT**: Convert speech to text with high accuracy
- **OpenAI TTS**: Generate natural-sounding voice responses
- **Voice Models**: Support for 6 different voices (alloy, echo, fable, onyx, nova, shimmer)
- **Real-time Recording**: Live audio recording with visual feedback
- **Audio Processing**: Noise reduction, echo cancellation, and auto-gain control

### 🎨 **Visual Interface**
- **Animated Blob**: Organic, morphing blob design with customizable colors
- **Voice Visualization**: Real-time equalizer bars that respond to audio
- **Status Indicators**: Visual feedback for recording, processing, and playback states
- **Gradient Customization**: Multiple gradient directions and color schemes

### ⚡ **Quick Actions**
- **Summarize**: Automatically summarize page content or selections
- **Explain**: Break down complex concepts into simple terms
- **Search**: Intelligent search assistance
- **Schedule**: Task and event scheduling help
- **Enhance**: Content improvement suggestions
- **Brainstorm**: Idea generation and creative assistance

### 💬 **Chat Interface**
- **Floating Chat**: Expandable chat interface with message history
- **Real-time Conversation**: Seamless text and voice interactions
- **Auto-transcription**: Automatic speech-to-text conversion
- **Voice Responses**: Optional automatic voice playback of responses

## 🚀 Quick Start

1. **Set up OpenAI API Key**:
   ```bash
   # Add to .env.local
   OPENAI_API_KEY=your_openai_api_key_here
   STT_TESTING_MODE=true
   TTS_TESTING_MODE=true
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access Oracle**:
   - Look for the animated blob in the bottom-right corner
   - Click to open chat interface
   - Right-click for quick actions menu
   - Use microphone button for voice input

## 📡 API Endpoints

### Speech-to-Text (STT)
```
POST /api/ai/voice/stt
```

**Request Format:**
- `FormData` with audio file
- `language`: Language code (e.g., 'en', 'es', 'fr')
- `prompt`: Context prompt for better transcription

**Response:**
```json
{
  "text": "Transcribed speech text",
  "language": "en",
  "duration": 5.2
}
```

### Text-to-Speech (TTS)
```
POST /api/ai/voice/tts
```

**Request:**
```json
{
  "text": "Text to convert to speech",
  "voice": "alloy",
  "speed": 1.0,
  "response_format": "mp3"
}
```

**Response:** Audio binary data (MP3/Opus/AAC/FLAC)

## ⚙️ Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Testing Mode (bypasses authentication in development)
STT_TESTING_MODE=true
TTS_TESTING_MODE=true
```

### Settings Access
- Click the settings gear icon on the Oracle blob
- Navigate to `/settings/oracle` for full configuration
- Available settings tabs:
  - **Appearance**: Colors, animations, blob customization
  - **Behavior**: Personality, response style, AI parameters
  - **Voice**: STT/TTS settings, voice models, audio quality
  - **Context**: Memory, conversation settings
  - **Tools**: Quick actions, integrations
  - **Advanced**: Performance, debug options

## 🎯 Usage Guide

### Basic Chat
1. Click the Oracle blob to open the chat interface
2. Type a message or use voice input
3. Press Enter or click Send to submit
4. Responses can be played back automatically if TTS is enabled

### Voice Input
1. Click the microphone button to start recording
2. Speak your message clearly
3. Click the stop button or wait for automatic detection
4. The speech will be transcribed and can be auto-sent

### Quick Actions
1. Right-click the Oracle blob to open quick actions menu
2. Select from predefined actions:
   - **Summarize**: Summarize current page content
   - **Explain**: Explain complex concepts
   - **Search**: Get search assistance
   - **Schedule**: Help with scheduling
   - **Enhance**: Improve content
   - **Brainstorm**: Generate ideas
3. The action will populate the chat with a relevant prompt
4. Customize or send the prompt as needed

## 🔧 Technical Details

### Voice Processing
- **Audio Capture**: Uses `MediaRecorder` API with WebM/Opus format
- **Noise Reduction**: Built-in echo cancellation and noise suppression
- **Real-time Feedback**: Visual recording timer and status indicators
- **Format Support**: MP3, Opus, AAC, FLAC for playback

### Visual Effects
- **Equalizer Animation**: 5 different animation patterns for voice bars
- **Blob Morphing**: Organic shape changes with customizable speed
- **Glow Effects**: Dynamic lighting with adjustable intensity
- **Floating Animation**: Smooth up/down movement with rotation

### State Management
- **React Hooks**: Comprehensive state management for voice, chat, and UI
- **localStorage**: Automatic settings persistence
- **Real-time Sync**: Settings updates across components
- **Memory Management**: Proper cleanup of audio resources

## 🌐 Browser Support

| Browser | Version | STT | TTS | Notes |
|---------|---------|-----|-----|-------|
| Chrome  | 47+     | ✅  | ✅  | Full support |
| Firefox | 25+     | ✅  | ✅  | Full support |
| Safari  | 14+     | ✅  | ✅  | Requires HTTPS |
| Edge    | 79+     | ✅  | ✅  | Full support |

### Required APIs
- `MediaRecorder` (voice recording)
- `Web Audio API` (audio playback)
- `localStorage` (settings persistence)
- `Fetch API` (API communications)

## 🛠️ Development

### File Structure
```
components/oracle/
├── oracle-blob.tsx           # Main Oracle blob component

app/api/ai/voice/
├── stt/route.ts             # Speech-to-text endpoint
└── tts/route.ts             # Text-to-speech endpoint

app/settings/oracle/
├── appearance/page.tsx       # Appearance settings
├── voice/page.tsx           # Voice settings
├── behavior/page.tsx        # Behavior settings
├── context/page.tsx         # Context settings
├── tools/page.tsx           # Tools settings
└── advanced/page.tsx        # Advanced settings
```

### Adding Custom Quick Actions

```typescript
// Add to quickActions array in oracle-blob.tsx
{
  id: 'custom-action',
  label: 'Custom Action',
  icon: <CustomIcon className="h-4 w-4" />,
  description: 'Description of your custom action',
  action: () => {
    handleQuickAction('Your custom prompt here')
  }
}
```

## 🔒 Security & Privacy

### API Security
- Authentication bypass only in testing mode
- Credit system integration for production use
- Rate limiting on voice API endpoints
- Content policy validation for TTS

### Privacy Protection
- Audio data processed server-side only
- No persistent storage of voice recordings
- Settings stored locally in browser only
- OpenAI API compliance with data handling

## 🐛 Troubleshooting

### Common Issues

**🎤 Voice recording not working:**
- Check microphone permissions in browser
- Ensure HTTPS connection (required for MediaRecorder)
- Verify browser supports WebM/Opus format

**🔌 API errors:**
- Verify OpenAI API key is correctly set
- Check network connectivity
- Ensure sufficient OpenAI credits

**💾 Settings not persisting:**
- Check localStorage is enabled
- Verify no browser extensions blocking storage
- Clear browser cache and reload

**🔊 Audio playback issues:**
- Check browser audio format support
- Verify volume settings
- Test with different voice models

### Debug Mode

Enable debug logging:
```javascript
localStorage.setItem('oracleDebug', 'true')
```

This logs:
- API requests and responses
- Audio processing steps
- Settings changes
- Error details

## 🚀 Performance Tips

### Audio Optimization
- Use appropriate audio formats for target browsers
- Implement audio compression for faster transmission
- Cache frequently used TTS responses
- Optimize recording buffer sizes

### UI Optimization
- Lazy load chat interface components
- Debounce settings changes
- Use CSS animations for smooth performance
- Optimize equalizer bar rendering

## 🔮 Future Enhancements

### Planned Features
- **Multi-language Support**: Automatic language detection
- **Voice Training**: Custom voice model fine-tuning
- **Conversation Memory**: Persistent chat history
- **Plugin System**: Extensible quick actions
- **Voice Commands**: Wake word activation
- **Audio Effects**: Real-time voice processing

### Integration Opportunities
- **Calendar Integration**: Direct scheduling capabilities
- **Email Integration**: Voice-to-email composition
- **Document Processing**: Voice-controlled document editing
- **Smart Home**: IoT device control via voice
- **Meeting Integration**: Voice meeting summaries

## 📊 Current Status

✅ **Completed Features:**
- OpenAI Whisper STT integration
- OpenAI TTS with 6 voice models
- Animated blob with voice visualization
- 6 predefined quick actions
- Comprehensive settings interface
- Real-time chat interface
- Audio recording and playback
- Settings persistence

🔄 **In Progress:**
- Advanced voice commands
- Multi-language support
- Enhanced error handling

📋 **Planned:**
- Conversation memory
- Plugin system
- Advanced integrations

---

## 📞 Support

For issues, feature requests, or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify environment configuration
4. Test with different browsers/devices

The Oracle AI integration provides a powerful, voice-enabled assistant experience with extensive customization options and robust error handling. 