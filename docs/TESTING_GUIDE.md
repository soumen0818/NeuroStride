# 🧪 NeuroStride Testing Guide

## 📋 Quick Reference

### Updated Thresholds (After Optimization)

| Metric | Value | Purpose |
|--------|-------|---------|
| **Down Detection** | Knee < 105° | Triggers "going down" state |
| **Up Detection** | Knee > 130° | Triggers "rep complete" state |
| **Deep Squat** | Knee < 80° | Full depth squat |
| **Moderate Squat** | Knee 80-135° | Good form range ✅ |
| **Shallow Squat** | Knee > 135° | Needs to go deeper |
| **Knee Valgus Ratio** | < 0.5 | Dangerous knee position |

---

## 🎯 Step-by-Step Testing Protocol

### Phase 1: Setup & Camera Check (2 minutes)

1. **Open Browser Developer Console**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to "Console" tab
   - Keep it open to see debug logs

2. **Start Application**
   - Click "Start Tracking" button
   - Grant camera permission
   - Wait for "Running" status

3. **Position Yourself**
   - Stand 6-8 feet from camera
   - Ensure full body is visible (head to feet)
   - Face camera directly
   - Check that skeleton appears on screen

✅ **Expected**: Green skeleton overlay visible, all 17 keypoints detected

---

### Phase 2: Rep Counting Test (5 minutes)

#### Test 1: Single Rep Detection

**Steps:**
1. Stand upright (starting position)
2. Slowly squat down until knee angle shows **~100°**
3. Watch console - should see: `🔽 Going DOWN - Angle: [value]`
4. Hold bottom position for 1 second
5. Slowly stand back up until knee angle shows **~140°**
6. Watch console - should see: `🔼 Coming UP - Rep completed! Angle: [value]`

**Expected Results:**
- ✅ Rep count increases from 0 → 1
- ✅ Console shows both down and up messages
- ✅ Skeleton turns green during good form

**Troubleshooting:**
- ❌ No down detection → Go lower (target < 105°)
- ❌ No up detection → Stand fully upright (target > 130°)
- ❌ No rep count → Check console for errors

---

#### Test 2: Multiple Reps (6 Proper Squats)

**Steps:**
1. Perform 6 squats with proper form:
   - Go down until knee angle: **90-100°**
   - Come up fully to: **140-160°**
   - Keep knees aligned over toes
   - Maintain steady pace (3 seconds down, 3 seconds up)

**Expected Results:**
- ✅ Total Reps: **6**
- ✅ Good Form Reps: **5-6** (most should be good)
- ✅ Accuracy: **80-100%**
- ✅ Console shows depth as "Moderate" or "Deep"

**What to Watch:**
- Each squat triggers console logs
- "Good Form?" should show `true` for most reps
- Depth should read "Moderate" or "Deep"
- No knee valgus warnings (unless knees cave in)

---

### Phase 3: Good Form Recognition Test (3 minutes)

#### Test 3A: Perfect Form Squat

**Steps:**
1. Stand with feet shoulder-width apart
2. Squat down to **parallel** (thighs parallel to ground)
   - Target knee angle: **90-100°**
3. Keep knees tracking over toes (no inward collapse)
4. Stand back up fully

**Expected Console Output:**
```
🔽 Going DOWN - Angle: 98
✅ Good Form? true - Depth: Moderate - Knee Valgus: false
🔼 Coming UP - Rep completed! Angle: 145
```

**Expected UI:**
- ✅ Good Form counter increases
- ✅ Depth badge shows "Moderate" (yellow) or "Deep" (green)
- ✅ Skeleton stays GREEN throughout
- ✅ No warning messages

---

#### Test 3B: Shallow Squat (Should NOT Count as Good)

**Steps:**
1. Do a partial squat - only go down **20-30%**
   - Target knee angle: **140-150°**
2. Stand back up

**Expected Console Output:**
```
✅ Good Form? false - Depth: Shallow - Knee Valgus: false
```

**Expected UI:**
- ✅ Total reps increases
- ❌ Good Form counter does NOT increase
- ⚠️ Depth badge shows "Shallow" (gray)
- ⚠️ Skeleton turns YELLOW

---

#### Test 3C: Knee Valgus Detection (Bad Form)

**Steps:**
1. Intentionally let knees cave inward during squat
2. Go to parallel depth
3. Complete the squat

**Expected Console Output:**
```
✅ Good Form? false - Depth: Moderate - Knee Valgus: true
```

**Expected UI:**
- ✅ Total reps increases
- ❌ Good Form counter does NOT increase
- ⚠️ Warnings counter increases
- 🔴 Skeleton turns RED
- 🚨 Red warning banner appears: "KNEE VALGUS DETECTED"
- 🎯 Red circles highlight problem knees

---

### Phase 4: Edge Cases & Stress Test (3 minutes)

#### Test 4A: Very Fast Squats

**Steps:**
1. Do 3 rapid squats (1 second each)
2. Check if all are counted

**Expected:**
- ✅ All reps counted
- ⚠️ May miss 1 if too fast (< 0.5 seconds)

---

#### Test 4B: Paused Mid-Squat

**Steps:**
1. Go down halfway
2. Hold position for 5 seconds
3. Go lower to complete squat
4. Stand up

**Expected:**
- ✅ Only counts as 1 rep
- ✅ No double-counting

---

#### Test 4C: Incomplete Squat

**Steps:**
1. Go down to 110° (not low enough)
2. Stand back up

**Expected:**
- ❌ Rep NOT counted (didn't reach < 105°)
- Console shows no "Going DOWN" message

---

### Phase 5: UI Verification (2 minutes)

#### Checklist:

**Live Metrics Card:**
- [ ] Knee Angle updates every frame (smooth, not jittery)
- [ ] Hip Angle shows values
- [ ] Depth badge changes color (green/yellow/gray)
- [ ] Rep count increases correctly
- [ ] Good Form count increases for proper squats only

**Session Stats Card:**
- [ ] Total Reps = all completed squats
- [ ] Good Reps = proper form squats only
- [ ] Warnings = knee valgus detections
- [ ] Accuracy % = (Good / Total) × 100

**Visual Feedback:**
- [ ] Skeleton color changes (green → yellow → red)
- [ ] Warning badges appear for bad form
- [ ] Red circles highlight problem areas
- [ ] Status badge shows "Running" (green, pulsing)

---

## 📊 Expected Test Results Summary

### Successful Test Scenario:

| Action | Total Reps | Good Reps | Warnings | Accuracy |
|--------|------------|-----------|----------|----------|
| 6 proper squats | 6 | 5-6 | 0-1 | 83-100% |
| 3 shallow squats | 9 | 5-6 | 0-1 | 55-66% |
| 2 knee valgus squats | 11 | 5-6 | 2-3 | 45-55% |

---

## 🐛 Common Issues & Solutions

### Issue 1: No Reps Counting

**Symptoms:**
- Squatting but rep count stays at 0
- No console logs appearing

**Solutions:**
1. Check knee angle display - is it updating?
2. Go LOWER - make sure knee angle drops below **105°**
3. Stand FULLY upright - knee angle must exceed **130°**
4. Check console for errors

---

### Issue 2: All Reps Showing as Bad Form

**Symptoms:**
- Total reps increasing
- Good form stuck at 0
- Console shows `Good Form? false`

**Check Console for Reason:**
- If `Depth: Shallow` → **Go deeper** (aim for 90-100° knee angle)
- If `Knee Valgus: true` → **Keep knees out** (don't let them cave inward)

**Solutions:**
- Focus on hitting **80-135° knee angle** range
- Keep knees tracking over toes
- Go to at least parallel depth

---

### Issue 3: Double Counting Reps

**Symptoms:**
- One squat counts as 2+ reps
- Rep counter jumps erratically

**Solutions:**
1. Slow down movement (3 sec down, 3 sec up)
2. Make sure you return to FULL standing (> 130°) between reps
3. Don't bounce at bottom - pause briefly

---

### Issue 4: Metrics Fluctuating Too Much

**Symptoms:**
- Angles jumping around rapidly
- Hard to read numbers

**Note:** This should be fixed with smoothing! If still happening:
1. Check lighting - ensure bright, even lighting
2. Avoid busy background
3. Stand still (reduce body sway)
4. If persistent, increase smoothing buffer (currently 5 frames)

---

## 🎓 Pro Testing Tips

### 1. Console Debugging
Open console and watch for:
```
🔽 Going DOWN - Angle: 98
✅ Good Form? true - Depth: Moderate - Knee Valgus: false  
🔼 Coming UP - Rep completed! Angle: 145
```

### 2. Angle Monitoring
Watch the **Knee Angle** metric in real-time:
- Standing: **160-180°**
- Quarter squat: **130-150°**
- Parallel squat: **90-110°** ← Sweet spot!
- Deep squat: **70-90°**

### 3. Form Checklist
For "Good Form" to register, you need:
- ✅ Depth: Moderate or Deep (not Shallow)
- ✅ No knee valgus warning
- ✅ Complete the full range (down < 105°, up > 130°)

### 4. Camera Position
Optimal setup:
- **Distance**: 6-8 feet
- **Height**: Waist level
- **Angle**: Straight-on (not from above/below)
- **Lighting**: Bright, from front or side

---

## ✅ Success Criteria

Your system is working correctly if:

1. **Rep Counting**: 6 proper squats → Total = 6
2. **Good Form Detection**: 6 proper squats → Good = 5-6 (83%+ accuracy)
3. **Bad Form Detection**: Shallow squats don't count as good
4. **Injury Warning**: Knee valgus triggers red warning
5. **Smooth Metrics**: Angles are readable (not jumping wildly)
6. **Console Logs**: Clear messages for each state change

---

## 🎯 Quick Troubleshooting Commands

### Check Current State:
```javascript
// Open console and type:
console.log("Tracking:", isTrackingRef.current);
console.log("Current Angle:", lastKneeAngleRef.current);
console.log("Rep State:", repStateRef.current);
```

### Manual Reset:
Click "Reset" button - should:
- Clear all counters
- Stop camera
- Clear canvas
- Reset to "Ready" state

---

## 📞 Report Issues

If tests fail, provide:
1. Console log output
2. Which test failed (e.g., "Test 2: Multiple Reps")
3. Expected vs actual results
4. Screenshot of UI
5. Browser and version

---

<div align="center">
  <strong>Happy Testing! 🚀</strong>
  <br>
  <sub>For best results, ensure good lighting and clear camera view</sub>
</div>
