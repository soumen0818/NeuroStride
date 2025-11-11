# NeuroStride System Verification Guide

## 🎯 How to Verify Your System is Giving Accurate Data

This guide will help you verify that the AI system is detecting movement correctly and providing accurate feedback.

---

## 1️⃣ SQUAT MODE VERIFICATION

### **Test 1: Rep Counter Accuracy**

**What to Test:**
- Does the system count each complete squat rep?

**How to Test:**
1. Switch to "Squat Form" mode
2. Stand 5-6 feet from camera, facing it
3. Perform 5 slow, controlled squats
4. Manually count your reps while watching the screen

**Expected Result:**
- ✅ Rep counter should match your manual count (±1 rep is acceptable)
- ✅ Rep increases when you stand back up from squat

**What This Verifies:** 
The system correctly tracks knee angle changes and state transitions (up → down → up)

---

### **Test 2: Angle Measurements**

**What to Test:**
- Are knee and hip angles realistic?

**How to Test:**
1. Perform a deep squat and hold for 2 seconds
2. Look at the "Knee Angle" value
3. Stand up straight and look at the angle again

**Expected Results:**
- **Standing (legs straight):** Knee angle should be ~160-180°
- **Deep squat (thighs parallel to ground):** Knee angle should be ~70-90°
- **Shallow squat:** Knee angle should be ~120-140°

**What This Verifies:**
The geometric calculations for joint angles are correct

---

### **Test 3: Depth Classification**

**What to Test:**
- Does the system correctly classify squat depth?

**How to Test:**
1. Do a very shallow squat (barely bending knees)
2. Check the "Depth" label → Should show **"Shallow"**
3. Do a moderate squat (thighs at ~45° angle)
4. Check the "Depth" label → Should show **"Moderate"**
5. Do a deep squat (thighs parallel to ground or lower)
6. Check the "Depth" label → Should show **"Deep"**

**Expected Results:**
- Shallow squat (knee angle > 120°) = "Shallow"
- Moderate squat (knee angle 80-120°) = "Moderate"
- Deep squat (knee angle < 80°) = "Deep"

**What This Verifies:**
Depth detection thresholds are working correctly

---

### **Test 4: Injury Detection - Knee Valgus** ⚠️

**What to Test:**
- Does the system detect when knees cave inward (knee valgus)?

**How to Test:**
1. Do a squat with good form (knees tracking over toes)
2. Skeleton should be **GREEN**, no warnings
3. Now do a squat with INTENTIONALLY bad form:
   - Let your knees collapse inward toward each other
   - This is called "knee valgus" (common injury risk)

**Expected Results:**
- ✅ Skeleton turns **RED**
- ✅ Warning banner appears: "⚠️ KNEE VALGUS DETECTED - INJURY RISK!"
- ✅ Red pulsing circles appear around your knees
- ✅ Warning count in session stats increases
- ✅ Coaching cue changes to "⚠️ Keep knees outward!"

**What This Verifies:**
The injury detection algorithm is working correctly

---

### **Test 5: Form Quality Feedback**

**What to Test:**
- Does skeleton color change based on form quality?

**How to Test:**
1. Do a good deep squat
   - Expected: **GREEN** skeleton ✅
2. Do a shallow squat (barely going down)
   - Expected: **YELLOW** skeleton ⚠️
3. Do a knee valgus squat (knees caving in)
   - Expected: **RED** skeleton 🚨

**What This Verifies:**
Visual feedback system is responding correctly to form analysis

---

### **Test 6: Session Statistics**

**What to Test:**
- Are session stats tracking correctly?

**How to Test:**
1. Reset by refreshing the page
2. Do 5 squats with GOOD form
   - Session stats should show: Total: 5, Good: 5, Warnings: 0
   - Accuracy should be **100%**
3. Do 3 squats with BAD form (knee valgus)
   - Session stats should update: Total: 8, Good: 5, Warnings: 3
   - Accuracy should be **62%** (5/8)

**What This Verifies:**
Session tracking and accuracy calculations are correct

---

## 2️⃣ WALK MODE VERIFICATION

### **Test 7: Step Counter**

**What to Test:**
- Does the system count steps accurately?

**How to Test:**
1. Switch to "Walk (Gait)" mode
2. Walk in place with exaggerated steps (lift knees high)
3. Count 10 steps manually

**Expected Result:**
- ✅ Step counter should track close to your manual count
- ✅ May have ±2 variance (acceptable due to gait detection complexity)

**What This Verifies:**
Step detection algorithm is working

---

### **Test 8: Step Width**

**What to Test:**
- Does step width measurement respond to changes?

**How to Test:**
1. Walk with very narrow stance (feet close together)
   - Expected: Step width should be **low** (< 5%)
2. Walk with wide stance (feet far apart)
   - Expected: Step width should be **high** (> 15%)

**What This Verifies:**
Ankle distance calculations are working

---

### **Test 9: Symmetry Analysis**

**What to Test:**
- Does the system detect asymmetric walking?

**How to Test:**
1. Walk normally with balanced steps
   - Expected: Symmetry should be **high** (> 85)
2. Walk with exaggerated limp (favor one leg)
   - Expected: Symmetry should **drop** (< 80)
   - Skeleton may turn **YELLOW**

**What This Verifies:**
Left/right knee angle comparison is working

---

## 3️⃣ TECHNICAL VERIFICATION

### **Test 10: Pose Detection Quality**

**What to Check:**
- Are all body parts being tracked?

**How to Verify:**
1. Stand in front of camera
2. Look at the skeleton overlay
3. All joints should have visible dots:
   - ✅ Shoulders (left & right)
   - ✅ Elbows (left & right)
   - ✅ Wrists (left & right)
   - ✅ Hips (left & right)
   - ✅ Knees (left & right)
   - ✅ Ankles (left & right)

**If joints are missing:**
- Improve lighting
- Move back from camera (6 feet optimal)
- Ensure full body is visible in frame
- Wear contrasting clothing (avoid camouflage patterns)

---

### **Test 11: Frame Rate Check**

**What to Check:**
- Is the system running smoothly at 30+ FPS?

**How to Verify:**
1. Open browser developer tools (F12)
2. Go to "Console" tab
3. The skeleton should move smoothly with no lag
4. Status badge should show **"Running"** with green background

**Expected Performance:**
- ✅ Smooth, real-time tracking
- ✅ No visible lag between your movement and skeleton response
- ✅ Status stays "Running" (not stuck on "Loading model...")

**If performance is poor:**
- Close other browser tabs
- Use Chrome or Edge (better WebGL support)
- Ensure GPU drivers are updated

---

### **Test 12: Camera Feed Quality**

**What to Check:**
- Is the video feed clear and properly mirrored?

**How to Verify:**
1. Wave your right hand
2. The skeleton's LEFT side should move (mirrored correctly)
3. Video should be clear (not pixelated or dark)

**Expected:**
- ✅ Mirrored video (like looking in a mirror)
- ✅ Clear image quality
- ✅ Good lighting on your body

---

## 4️⃣ EDGE CASES TO TEST

### **Test 13: Multiple People**

**What Happens:**
- System is designed for single-person use
- If 2+ people are in frame, it tracks the most prominent person

**Test:**
Have someone walk behind you → System should still track YOU

---

### **Test 14: Partial Occlusion**

**What Happens:**
- If part of body is out of frame, system tries to estimate

**Test:**
Step partially out of frame → Skeleton should show "No person detected" or partial tracking

---

### **Test 15: Different Clothing**

**What to Test:**
Does tracking work with different outfits?

**Test with:**
- ✅ Tight clothing (best)
- ✅ Loose clothing (works)
- ⚠️ Very baggy clothes (may reduce accuracy)
- ✅ Different skin tones (model is trained on diverse data)

---

## 5️⃣ CALIBRATION & BEST PRACTICES

### **Optimal Setup:**

1. **Distance:** 5-6 feet from camera
2. **Lighting:** Bright, even lighting (avoid backlighting)
3. **Background:** Plain background (not busy patterns)
4. **Clothing:** Fitted clothes, contrast with background
5. **Position:** Full body visible in frame
6. **Angle:** Face camera directly (not at an angle)

### **Common Issues & Fixes:**

| Problem | Solution |
|---------|----------|
| No skeleton showing | Allow camera permissions, refresh page |
| Skeleton jittery | Improve lighting, reduce background motion |
| Rep counter not working | Do slower, more controlled movements |
| Angles seem wrong | Ensure full body visible, face camera directly |
| Knee valgus not detected | Exaggerate the knee collapse inward |

---

## 6️⃣ DATA ACCURACY BENCHMARKS

### **Expected Accuracy:**

| Metric | Expected Range | Your Test Result |
|--------|---------------|------------------|
| Rep counting accuracy | 95-100% | _________ |
| Angle measurement error | ±5 degrees | _________ |
| Knee valgus detection | 90%+ true positive | _________ |
| Step counting accuracy | 90-95% | _________ |
| Frame rate (FPS) | 25-40 FPS | _________ |

---

## 7️⃣ VERIFICATION CHECKLIST

Print this and check off each test:

- [ ] Test 1: Rep counter matches manual count
- [ ] Test 2: Knee angles are realistic (70-180°)
- [ ] Test 3: Depth classification works (Shallow/Moderate/Deep)
- [ ] Test 4: Knee valgus detection triggers warning
- [ ] Test 5: Skeleton color changes (Green/Yellow/Red)
- [ ] Test 6: Session stats calculate correctly
- [ ] Test 7: Step counter tracks walking
- [ ] Test 8: Step width changes with stance
- [ ] Test 9: Symmetry detects limping
- [ ] Test 10: All 17 keypoints visible
- [ ] Test 11: Smooth performance (no lag)
- [ ] Test 12: Video properly mirrored
- [ ] Test 13: Works with one person only
- [ ] Test 14: Handles partial occlusion
- [ ] Test 15: Works with different clothing

---

## 8️⃣ DEMO DAY CHECKLIST

### **Before Your Pitch:**

- [ ] Test camera permissions in advance
- [ ] Test with the actual lighting at pitch venue (if possible)
- [ ] Practice your demo routine (3 good squats, 2 bad squats)
- [ ] Have backup: Record a demo video in case of technical issues
- [ ] Clear browser cache before demo
- [ ] Close all other tabs/applications
- [ ] Test with the same clothes you'll wear for pitch
- [ ] Mark optimal standing spot on floor (6 feet from camera)

### **During Demo:**

- [ ] Show good form first (green skeleton)
- [ ] Then show bad form (red skeleton + warning)
- [ ] Point out the real-time metrics updating
- [ ] Highlight the injury detection feature
- [ ] Show session statistics

---

## 🎯 FINAL VALIDATION

Your system is **ACCURATE** if:

✅ Rep counting is within 1-2 reps of manual count  
✅ Angles match expected ranges for standing/squatting  
✅ Knee valgus triggers RED warning consistently  
✅ Skeleton color changes based on form quality  
✅ Session stats calculate correctly  
✅ Performance is smooth with no lag  

---

## 📊 WHAT THE DATA MEANS

### **Knee Angle:**
- **180°** = Standing straight (locked knees)
- **160-170°** = Normal standing
- **90°** = Sitting position / deep squat (thighs parallel to ground)
- **70-80°** = Very deep squat
- **< 70°** = Extreme deep squat (ATG - ass to grass)

### **Hip Angle:**
- **180°** = Standing straight
- **90°** = Bent 90 degrees at hip
- Decreases as you squat deeper

### **Step Width:**
- **< 5%** = Very narrow stance (feet close)
- **8-15%** = Normal walking width
- **> 20%** = Very wide stance

### **Symmetry:**
- **100** = Perfect symmetry (both sides identical)
- **90-100** = Excellent balance
- **80-90** = Good balance
- **< 80** = Asymmetric (possible injury or imbalance)

---

## 🔬 TECHNICAL VALIDATION

### **How to Check Console for Errors:**

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Should see NO red errors
4. If you see warnings about WebGL, that's normal

### **Expected Console Output:**
```
✅ TensorFlow.js initialized
✅ MoveNet model loaded
✅ Webcam stream started
✅ Detection running at ~30 FPS
```

---

## 🎉 CONCLUSION

If you've completed all tests and your system:
- ✅ Counts reps accurately
- ✅ Measures angles correctly
- ✅ Detects knee valgus
- ✅ Provides color-coded feedback
- ✅ Runs smoothly at 30 FPS

**Your system is WORKING CORRECTLY and ready for demo! 🚀**

---

## 📞 TROUBLESHOOTING

If something isn't working, try:

1. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache:** Browser Settings → Clear browsing data
3. **Try different browser:** Chrome or Edge recommended
4. **Check lighting:** Add more lights, avoid backlighting
5. **Update GPU drivers:** Especially for laptops with integrated graphics

---

Good luck with your pitch tomorrow! 🎯💪
