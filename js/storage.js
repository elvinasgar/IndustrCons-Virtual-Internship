/**
 * IndustrCons IRE-3 — Storage / Progress Engine
 * All user state lives in localStorage under one namespaced key.
 * No backend, no database — everything here is client-side by design.
 */
window.IC = window.IC || {};

IC.store = (function () {
  const KEY = 'ic_user_state_v1';
  const XP_PER_LEVEL = 500; // flat curve, easy to tune later

  const BADGE_DEFS = {
    first_internship: { name: 'First Internship', icon: '🎯' },
    engineer_rookie: { name: 'Engineer Rookie', icon: '⚙️' },
    site_expert: { name: 'Site Expert', icon: '🏗️' },
    estimator: { name: 'Estimator', icon: '📐' },
    planner: { name: 'Planner', icon: '🗓️' },
    safety_champion: { name: 'Safety Champion', icon: '🦺' },
    qa_master: { name: 'QA Master', icon: '✅' },
    project_coordinator: { name: 'Project Coordinator', icon: '🧭' },
    construction_leader: { name: 'Construction Leader', icon: '👷' },
    industry_ready: { name: 'Industry Ready', icon: '🏅' },
    full_completion: { name: '100% Completion', icon: '💯' }
  };

  function defaultState() {
    return {
      profile: { name: 'Guest Student', createdAt: Date.now() },
      xp: 0,
      badges: [],
      hoursLearned: 0,
      streak: { count: 0, lastActive: null },
      internships: {}, // { [internshipId]: { status, currentStep, tasksDone: {}, quizScore, startedAt, completedAt, certNo } }
      activity: [] // { ts, label }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      console.warn('IC.store: corrupt state, resetting.', e);
      return defaultState();
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function touchStreak(state) {
    const today = new Date().toDateString();
    const last = state.streak.lastActive;
    if (last === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    state.streak.count = (last === yesterday) ? state.streak.count + 1 : 1;
    state.streak.lastActive = today;
  }

  function logActivity(state, label) {
    state.activity.unshift({ ts: Date.now(), label });
    state.activity = state.activity.slice(0, 25);
  }

  function addXp(amount, label) {
    const state = load();
    state.xp += amount;
    touchStreak(state);
    if (label) logActivity(state, label);
    save(state);
    return getLevelInfo(state.xp);
  }

  function awardBadge(badgeKey) {
    const state = load();
    if (!state.badges.includes(badgeKey) && BADGE_DEFS[badgeKey]) {
      state.badges.push(badgeKey);
      logActivity(state, `Earned badge: ${BADGE_DEFS[badgeKey].name}`);
      save(state);
      return true; // newly earned
    }
    return false;
  }

  function getLevelInfo(xp) {
    xp = xp !== undefined ? xp : load().xp;
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const into = xp % XP_PER_LEVEL;
    return { level, xp, xpIntoLevel: into, xpForNextLevel: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
  }

  function getInternshipProgress(internshipId) {
    const state = load();
    return state.internships[internshipId] || { status: 'not_started', currentStep: 0, tasksDone: {}, quizScore: null };
  }

  function startInternship(internshipId) {
    const state = load();
    if (!state.internships[internshipId]) {
      state.internships[internshipId] = {
        status: 'in_progress', currentStep: 0, tasksDone: {}, quizScore: null,
        startedAt: Date.now(), completedAt: null, certNo: null
      };
      logActivity(state, `Started internship: ${internshipId}`);
      save(state);
    }
    return state.internships[internshipId];
  }

  function setStep(internshipId, stepIndex) {
    const state = load();
    const rec = state.internships[internshipId];
    if (!rec) return;
    rec.currentStep = Math.max(rec.currentStep, stepIndex);
    save(state);
  }

  function completeTask(internshipId, taskId, xp) {
    const state = load();
    const rec = state.internships[internshipId];
    if (!rec) return;
    if (!rec.tasksDone[taskId]) {
      rec.tasksDone[taskId] = true;
      state.xp += xp;
      state.hoursLearned = Math.round((state.hoursLearned + 0.75) * 100) / 100;
      touchStreak(state);
      logActivity(state, `Completed task ${taskId}`);
    }
    save(state);
  }

  function recordQuiz(internshipId, score) {
    const state = load();
    const rec = state.internships[internshipId];
    if (!rec) return;
    rec.quizScore = score;
    save(state);
  }

  function completeInternship(internshipId, certNo) {
    const state = load();
    const rec = state.internships[internshipId];
    if (!rec) return null;
    rec.status = 'completed';
    rec.completedAt = Date.now();
    rec.certNo = certNo;
    logActivity(state, `Completed internship: ${internshipId}`);
    save(state);
    return rec;
  }

  function allInternships() {
    return load().internships;
  }

  function getState() { return load(); }
  function setProfileName(name) {
    const state = load();
    state.profile.name = name || 'Guest Student';
    save(state);
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  return {
    BADGE_DEFS,
    getState, getLevelInfo, addXp, awardBadge,
    getInternshipProgress, startInternship, setStep,
    completeTask, recordQuiz, completeInternship, allInternships,
    setProfileName, reset
  };
})();
