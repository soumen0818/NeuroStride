# 📊 NeuroStride Metrics Explained

## Understanding Your Dashboard

---

## 🎯 TWO TYPES OF DATA

### 1. **LIVE METRICS** (Real-time - Changes Every Frame)
📍 **Location:** Top-right panel with pulsing blue dot

**What it shows:** Your body's current position at this exact moment

**Update Rate:** 30 times per second (30 FPS)

**Why it fluctuates:** 
- You're breathing (chest moves up/down)
- Micro-adjustments for balance
- Natural body sway
- Camera sampling variations

**This is NORMAL!** Even when standing "still", your body is constantly moving slightly.

---

### 2. **SESSION STATS** (Cumulative - Running Total)
📍 **Location:** Below Live Metrics, has bar chart icon

**What it shows:** Summary of your entire workout session

**Update Rate:** Only changes when you complete a rep

**Why it accumulates:**
- Tracks performance over time
- Measures workout quality
- Provides overall accuracy score

---

## 📏 LIVE METRICS BREAKDOWN

### **Squat Mode:**

#### **Knee Angle** (degrees)
- **What it measures:** Angle between hip → knee → ankle
- **Standing:** ~160-180° (legs straight)
- **Shallow squat:** ~120-140°
- **Deep squat:** ~70-90°
- **Very deep:** <70° (ATG - ass to grass)

**Why it fluctuates:** 
- Even standing still, your knees aren't perfectly locked
- Breathing shifts your center of mass
- Small weight shifts (±5° is normal)

---

#### **Hip Angle** (degrees)
- **What it measures:** Angle between shoulder → hip → knee
- **Standing:** ~160-180° (straight body)
- **Moderate squat:** ~100-130°
- **Deep squat:** ~60-90°

**Why it fluctuates:**
- Connected to knee movement
- Breathing affects torso position
- Spinal alignment micro-adjustments

---

#### **Depth Label**
- **What it shows:** Classification of squat depth
- **"Shallow"** = Knee angle > 120° (barely squatting)
- **"Moderate"** = Knee angle 80-120° (half squat)
- **"Deep"** = Knee angle < 80° (full squat)

**Why it changes:**
- Updates as you move through squat motion
- Changes from Shallow → Moderate → Deep as you go down
- Reverses as you come back up

---

#### **Reps** (count)
- **What it tracks:** Complete squat repetitions
- **Counts when:** You go down AND come back up
- **Logic:** 
  1. Standing (up) → knee angle >160°
  2. Squatting (down) → knee angle <100°
  3. Standing again (up) → +1 rep counted

**Why it might miss reps:**
- Squat too shallow (doesn't reach <100°)
- Movement too fast (AI can't detect transition)
- Body partially out of frame

---

#### **Good Form** (count)
- **What it tracks:** Reps performed WITHOUT injury warnings
- **A "good" rep means:**
  - No knee valgus (knees didn't cave in)
  - Depth was NOT shallow
  - Maintained proper alignment

---

### **Walk Mode:**

#### **Step Width** (percentage)
- **What it measures:** Distance between ankles as % of frame width
- **Normal:** 8-15%
- **Narrow stance:** <5%
- **Wide stance:** >20%

**Why it fluctuates:**
- Changes with each step
- Natural gait variation
- Camera angle shifts

---

#### **Symmetry** (0-100 score)
- **What it measures:** How balanced left/right leg movements are
- **Perfect:** 100 (both legs identical)
- **Excellent:** 90-100
- **Good:** 80-90
- **Needs work:** <80 (limping or favoring one side)

**Calculation:** 100 - (difference between left and right knee angles)

**Why it fluctuates:**
- You don't walk like a robot
- Natural gait has slight asymmetries
- Averaging over multiple steps helps

---

#### **Steps** (count)
- **What it tracks:** Number of steps taken
- **Counts when:** System detects stride completion

---

## 📈 SESSION STATS BREAKDOWN

### **Total**
- **What it is:** Total number of reps/steps completed this session
- **Starts at:** 0 when you click "Start Tracking"
- **Increases:** +1 for each completed rep
- **Resets:** Click "Reset Stats" button

---

### **Good**
- **What it is:** Number of reps performed with correct form
- **Criteria for "good":**
  - ✅ No knee valgus detected
  - ✅ Depth was not shallow
  - ✅ Proper body alignment maintained

---

### **Warnings**
- **What it is:** Number of times injury risk was detected
- **Triggers when:**
  - 🚨 Knee valgus detected (knees caving in)
  - 🚨 Dangerous joint angles
  - 🚨 Poor alignment

**Important:** One rep can trigger multiple warnings!

---

### **Accuracy** (percentage)
- **What it is:** Your form quality score
- **Formula:** (Good reps ÷ Total reps) × 100%
- **Color coding:**
  - 🟢 Green (≥80%) = Excellent form
  - 🟡 Yellow (60-79%) = Needs improvement
  - 🔴 Red (<60%) = Poor form, high injury risk

**Example:**
- Total: 10 squats
- Good: 8 squats
- Warnings: 2 (2 had knee valgus)
- Accuracy: 80% (8÷10 × 100)

---

## 🔄 WHY DATA FLUCTUATES - DETAILED EXPLANATION

### **The Science:**

1. **Human Body is Dynamic:**
   - You breathe 12-20 times per minute
   - Heart pumps blood (creates micro-movements)
   - Muscles constantly adjust for balance
   - Even "standing still" involves micro-corrections

2. **AI Sampling Rate:**
   - System analyzes 30 frames per second
   - Each frame might show slightly different joint positions
   - ±3-5° variation is completely normal

3. **Camera & Lighting:**
   - Slight shadows can affect keypoint detection
   - Camera auto-adjust for brightness
   - Background movement creates noise

4. **This is GOOD!**
   - Proves the system is working in real-time
   - Shows authentic, live analysis (not fake/pre-recorded)
   - More responsive to actual movement

---

## 🎮 CONTROL BUTTONS EXPLAINED

### **Start Tracking** (Green)
- **When to use:** When you're ready to begin workout
- **What happens:**
  - Camera feed starts analyzing
  - Metrics begin updating
  - Rep counting begins
  - Status changes to "Running"

### **Pause** (Yellow)
- **When to use:** Need a break but don't want to stop session
- **What happens:**
  - Freezes rep counting
  - Metrics stop updating
  - Stats are preserved
  - Camera still shows video

### **Resume** (Green)
- **When to use:** Continue after pausing
- **What happens:**
  - Rep counting resumes
  - Metrics start updating again
  - Session stats continue from where you left off

### **Stop** (Red)
- **When to use:** Ending your workout
- **What happens:**
  - Stops all tracking
  - Metrics freeze at last values
  - Stats preserved (use Reset to clear)
  - Can click Start to begin new session

### **Reset Stats** (Blue)
- **When to use:** Starting fresh session
- **What happens:**
  - All counters reset to 0
  - Session stats cleared
  - Metrics reset
  - Ready for new workout

---

## 📋 TYPICAL WORKFLOW

### **Demo/Pitch Mode:**
```
1. Click "Start Tracking"
2. Perform 3-5 good squats (watch skeleton stay green)
3. Click "Pause"
4. Explain the metrics to judges
5. Click "Resume"
6. Perform 1-2 bad squats (knees caving in)
7. Show the red warning system
8. Click "Stop" when done
```

### **Practice Mode:**
```
1. Click "Start Tracking"
2. Do your full workout (10-20 squats)
3. Monitor your accuracy in real-time
4. Adjust form when you see yellow/red
5. Click "Stop" when finished
6. Review session stats
7. Click "Reset Stats" for next session
```

---

## 🎯 WHEN TO STOP CAMERA

### **You Should Stop When:**
- ✅ Finished your workout
- ✅ Demo is complete
- ✅ Want to save battery/CPU
- ✅ Need privacy (camera off)

### **You Can Leave It Running If:**
- 🏋️ Doing multiple sets (just use Pause between sets)
- 🎬 Want continuous tracking
- 📊 Building up session statistics
- 🔍 Testing different form variations

**Tip:** Use **Pause** for short breaks, **Stop** when completely done.

---

## 🧪 TEST IT YOURSELF

### **Experiment 1: See Fluctuation**
1. Start tracking
2. Stand perfectly still
3. Watch knee angle
4. You'll see it vary by ±3-5° even while "still"
5. This proves real-time analysis!

### **Experiment 2: Understand Rep Counting**
1. Start tracking
2. Do ONE very slow squat (take 5 seconds down, 5 seconds up)
3. Watch metrics change as you move
4. See exactly when rep increments

### **Experiment 3: Test Session Stats**
1. Reset stats
2. Do 5 perfect squats → Should show 5 Total, 5 Good, 100% Accuracy
3. Do 2 bad squats (knee valgus) → Should show 7 Total, 5 Good, 71% Accuracy
4. Verify the math!

---

## ❓ FAQ

### **Q: Why does knee angle show 173° one second and 168° the next, even when standing still?**
**A:** Your body is constantly making micro-adjustments for balance. This 5° variation is normal and shows the system is working in real-time.

---

### **Q: Do I need to stop the camera after every use?**
**A:** No, but it's good practice:
- **Stop** when completely done
- **Pause** for short breaks
- Keeps your computer cooler and saves battery

---

### **Q: Will session stats reset if I change modes (Squat ↔ Walk)?**
**A:** Yes! Switching modes automatically resets stats because the metrics are different for each exercise.

---

### **Q: Can I do multiple sessions without resetting?**
**A:** Technically yes, but not recommended. Session stats accumulate indefinitely until you click "Reset Stats". Best practice: Reset before each new workout.

---

### **Q: Why don't the live metrics match what a protractor would show?**
**A:** Small differences (±5-10°) are normal due to:
- 2D camera view vs 3D reality
- Body position relative to camera
- Joint center estimation by AI
- Good enough for form coaching!

---

### **Q: How long can I leave it running?**
**A:** Indefinitely! The system is designed for continuous use. However:
- Uses ~20-30% CPU continuously
- Camera stays on (privacy concern)
- Best to Stop when not actively using

---

## 🎓 PRO TIPS

### **For Your Pitch Tomorrow:**

1. **Start with Reset Stats** - Show judges you're starting at 0

2. **Do 3 good squats first** - Build up to 3 Total, 3 Good, 100% Accuracy

3. **Then do 2 bad squats** - Stats change to 5 Total, 3 Good, 60% Accuracy

4. **Pause during explanation** - Freeze metrics while you talk

5. **Use Reset between demos** - Fresh stats for each judge

---

## 🎬 DEMO SCRIPT USING METRICS

**Opening:** "Let me show you how NeuroStride prevents injuries in real-time."

*[Click Start Tracking]*

**During good squats:** "Watch the Live Metrics - my knee angle goes from 170° standing to 85° in a deep squat. The skeleton stays green because my form is good."

*[Complete 3 squats]*

**Point to Session Stats:** "See? 3 reps, all with good form, 100% accuracy."

*[Click Pause]*

**Explain:** "Now watch what happens when I intentionally do bad form..."

*[Click Resume]*

*[Do bad squat with knee valgus]*

**Point to screen:** "RED skeleton! Warning appears! Session stats update - warnings increased, accuracy dropped to 75%."

**Closing:** "This real-time feedback prevents injuries before they happen."

*[Click Stop]*

---

## 🎯 SUMMARY

- **Live Metrics** = Real-time (updates 30x/sec), shows current position
- **Session Stats** = Cumulative, tracks overall performance
- **Fluctuation is normal** = Proves real-time analysis
- **Use Start/Pause/Stop/Reset** = Full control over tracking
- **Stop when done** = Save resources, privacy

**Remember:** The data fluctuation is a FEATURE, not a bug! It shows authentic real-time AI analysis. 🚀
