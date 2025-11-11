# 🏃‍♂️ NeuroStride - AI-Powered Movement Analysis

> Real-time pose detection and injury prevention system powered by TensorFlow.js and MoveNet

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-FF6F00?style=flat-square&logo=tensorflow)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🎯 Overview

NeuroStride is an intelligent movement analysis platform that uses computer vision to track human pose in real-time and provide instant feedback on exercise form. Built with cutting-edge machine learning technology, it helps prevent injuries by detecting poor form and biomechanical issues during workouts.

### ✨ Key Features

- **🎥 Real-Time Pose Detection** - 30+ FPS tracking using MoveNet Lightning model
- **🦴 17-Point Skeleton Tracking** - Full body keypoint detection with high accuracy
- **⚠️ Injury Prevention** - Automatic detection of dangerous movement patterns (knee valgus, shallow squats)
- **📊 Live Metrics** - Real-time angle measurements, depth classification, and form analysis
- **🔄 Automatic Rep Counting** - Smart state machine tracks exercise repetitions
- **📈 Session Statistics** - Track total reps, good form reps, and accuracy percentage
- **🎨 Visual Feedback** - Color-coded skeleton (green/yellow/red) based on form quality
- **💪 Multiple Exercise Modes** - Squat and walk analysis with extensible architecture

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Modern browser** with WebGL support (Chrome, Firefox, Edge)
- **Webcam** for pose detection

### Installation

```bash
# Clone the repository
git clone https://github.com/soumen0818/NeuroStride.git
cd neurostride-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5174`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

1. **Grant Camera Permission** - Click "Start Tracking" to allow webcam access
2. **Position Yourself** - Stand 6-8 feet from camera, ensure full body is visible
3. **Select Exercise Mode** - Choose between Squat or Walk mode
4. **Start Exercising** - Perform movements while system tracks your form
5. **Watch for Warnings** - Red warnings appear for injury-risk movements
6. **Review Stats** - Check accuracy and form quality after session

### Controls

| Button | Function |
|--------|----------|
| **Start Tracking** | Opens camera and begins pose detection |
| **Pause** | Temporarily freezes tracking (camera stays on) |
| **Resume** | Continues tracking from paused state |
| **Stop** | Stops tracking and closes camera |
| **Reset** | Clears all stats and stops camera |

## 🏗️ Technology Stack

### Frontend
- **React 19** - UI framework with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling

### AI/ML
- **TensorFlow.js 4.22** - Browser-based machine learning
- **MoveNet Lightning** - Fast single-person pose detection model
- **WebGL Backend** - GPU-accelerated inference

### Computer Vision
- **Pose Detection** - 17 keypoint tracking (shoulders, hips, knees, ankles, etc.)
- **Geometric Analysis** - Angle calculations using vector mathematics
- **State Machine** - Rep counting and movement phase detection

## 📁 Project Structure

```
neurostride-demo/
├── src/
│   ├── components/
│   │   └── PoseDemo.tsx          # Main pose detection component
│   ├── lib/
│   │   └── geometry.ts           # Angle calculation utilities
│   ├── App.tsx                   # Root component with layout
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── tailwind.config.js           # Tailwind CSS configuration
```

## 🧠 How It Works

### 1. Pose Detection Pipeline
```
Camera Feed → TensorFlow.js → MoveNet Model → 17 Keypoints → Angle Analysis
```

### 2. Injury Detection Algorithm

**Knee Valgus Detection** (Knees caving inward):
```typescript
// Calculate knee-to-hip and knee-to-ankle angles
const leftKneeAngle = angleABC(leftHip, leftKnee, leftAnkle)
const rightKneeAngle = angleABC(rightHip, rightKnee, rightAnkle)

// Detect dangerous lateral movement
if (kneeAngle < 160°) → Warning: Knee Valgus Risk
```

### 3. Rep Counting State Machine
```
UP State → Knee Angle < 100° → DOWN State
DOWN State → Knee Angle > 120° → UP State (Rep Completed!)
```

### 4. Form Quality Classification
- **Green Skeleton** - Perfect form, safe movement
- **Yellow Skeleton** - Minor issues, be cautious
- **Red Skeleton** - Injury risk detected, stop immediately

## 📊 Metrics Explained

### Live Metrics (Updated 30x/second)
- **Hip Angle** - Current hip flexion angle
- **Knee Angle** - Current knee joint angle
- **Depth** - Squat depth (Shallow/Moderate/Deep)
- **Knee Status** - Valgus warning indicator

### Session Statistics (Cumulative)
- **Total Reps** - All completed repetitions
- **Good Form Reps** - Reps without warnings
- **Warnings** - Count of detected injury risks
- **Accuracy %** - (Good Reps / Total Reps) × 100

## 🎨 UI Features

- **Gradient Design** - Modern purple/blue color scheme
- **Animated Badges** - Pulsing status indicators
- **Color-Coded Feedback** - Visual form quality signals
- **Responsive Layout** - Video + metrics side-by-side
- **Glass-morphism Effects** - Backdrop blur and transparency
- **Professional Controls** - Compact, intuitive buttons

## ⚙️ Configuration

### Adjust Pose Detection Settings

Edit `src/components/PoseDemo.tsx`:

```typescript
// Model configuration
modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
enableSmoothing: true,  // Reduce jitter

// Camera settings
video: { 
  width: 1280, 
  height: 720, 
  facingMode: "user" 
}
```

### Customize Rep Counting Thresholds

```typescript
// Going down threshold
if (currentAngle < 100)  // Adjust for sensitivity

// Coming up threshold  
if (currentAngle > 120)  // Adjust for completion point
```

## 🔧 Troubleshooting

### Camera Not Working
- Check browser permissions (Settings → Privacy → Camera)
- Use HTTPS in production (HTTP may block camera access)
- Try different browsers (Chrome recommended)

### Slow Performance
- Ensure GPU acceleration is enabled
- Close other resource-intensive tabs
- Use MoveNet Lightning (faster) instead of Thunder model

### Skeleton Not Appearing
- Ensure good lighting conditions
- Stand further from camera for full body visibility
- Avoid busy/cluttered backgrounds

## 🚦 Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | ✅ Recommended |
| Firefox | 88+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Safari | 14+ | ⚠️ Limited WebGL support |

## 📈 Performance

- **FPS**: 30-60 frames per second
- **Latency**: <50ms inference time
- **Model Size**: ~12MB (MoveNet Lightning)
- **Memory Usage**: ~200MB GPU memory

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Soumen Dasgupta** - [@soumen0818](https://github.com/soumen0818)

## 🙏 Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning framework
- [MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html) - Pose detection model
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@neurostride.com (if available)

## 🗺️ Roadmap

- [ ] Multi-person pose detection
- [ ] Exercise library expansion (lunges, pushups, deadlifts)
- [ ] Video recording and playback
- [ ] Mobile app (React Native)
- [ ] Cloud-based workout history
- [ ] Personal trainer AI coaching
- [ ] Integration with fitness wearables

---

<div align="center">
  <strong>Built with ❤️ for a healthier future</strong>
  <br>
  <sub>Preventing injuries, one rep at a time</sub>
</div>

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
