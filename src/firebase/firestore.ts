import {
  addDoc,
  collection,
  deleteDoc,
  type Firestore,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, firebaseConfigError } from './config'
import type { DayPlan, Exercise, Program, WorkoutLog } from '../types'

interface LocalDbState {
  programs: Program[]
  days: DayPlan[]
  workoutLogs: WorkoutLog[]
}

const LOCAL_DB_KEY = 'vyayam_local_db_v1'
const GUEST_UID = 'guest-local'

const createLocalId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`

const readLocalDb = (): LocalDbState => {
  const raw = localStorage.getItem(LOCAL_DB_KEY)

  if (!raw) {
    return { programs: [], days: [], workoutLogs: [] }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalDbState>
    return {
      programs: parsed.programs ?? [],
      days: parsed.days ?? [],
      workoutLogs: parsed.workoutLogs ?? [],
    }
  } catch {
    return { programs: [], days: [], workoutLogs: [] }
  }
}

const writeLocalDb = (state: LocalDbState) => {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(state))
}

const isLocalProgram = (programId: string) => programId.startsWith('local_prog_')
const isLocalDay = (dayId: string) => dayId.startsWith('local_day_')
const shouldUseLocalForUser = (userId: string) => userId === GUEST_UID || !db

const sanitizeExercisesForWrite = (exercises: Exercise[]): Exercise[] => {
  return exercises.map((exercise) => {
    const cleaned: Exercise = {
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      rest: exercise.rest,
    }

    if (typeof exercise.reps === 'number') {
      cleaned.reps = exercise.reps
    }

    if (typeof exercise.duration === 'number') {
      cleaned.duration = exercise.duration
    }

    if (typeof exercise.notes === 'string' && exercise.notes.trim()) {
      cleaned.notes = exercise.notes.trim()
    }

    return cleaned
  })
}

const requireDb = (): Firestore => {
  if (!db) {
    throw new Error(firebaseConfigError ?? 'Firebase is not configured')
  }

  return db
}

export const createProgram = async (userId: string, title: string, startDate: string, endDate: string) => {
  if (shouldUseLocalForUser(userId)) {
    const state = readLocalDb()
    state.programs.push({
      id: createLocalId('local_prog'),
      userId,
      title,
      startDate,
      endDate,
      createdAt: new Date(),
    })
    writeLocalDb(state)
    return
  }

  const dbRef = requireDb()
  const programsRef = collection(dbRef, 'programs')
  await addDoc(programsRef, {
    userId,
    title,
    startDate,
    endDate,
    createdAt: serverTimestamp(),
  })
}

export const getProgramsByUser = async (userId: string): Promise<Program[]> => {
  if (shouldUseLocalForUser(userId)) {
    const state = readLocalDb()
    return state.programs.filter((program) => program.userId === userId)
  }

  const dbRef = requireDb()
  const programsRef = collection(dbRef, 'programs')
  const programsQuery = query(programsRef, where('userId', '==', userId))
  const snapshot = await getDocs(programsQuery)

  return snapshot.docs.map((entry) => {
    const data = entry.data() as {
      userId: string
      title: string
      startDate: string
      endDate: string
      createdAt?: { toDate: () => Date }
    }

    return {
      id: entry.id,
      userId: data.userId,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: data.createdAt?.toDate(),
    }
  })
}

export const getProgramById = async (programId: string): Promise<Program | null> => {
  if (isLocalProgram(programId) || !db) {
    const state = readLocalDb()
    return state.programs.find((program) => program.id === programId) ?? null
  }

  const dbRef = requireDb()
  const snap = await getDoc(doc(dbRef, 'programs', programId))

  if (!snap.exists()) {
    return null
  }

  const data = snap.data() as {
    userId: string
    title: string
    startDate: string
    endDate: string
    createdAt?: { toDate: () => Date }
  }

  return {
    id: snap.id,
    userId: data.userId,
    title: data.title,
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: data.createdAt?.toDate(),
  }
}

export const getDaysByProgram = async (programId: string): Promise<DayPlan[]> => {
  if (isLocalProgram(programId) || !db) {
    const state = readLocalDb()
    return state.days.filter((day) => day.programId === programId)
  }

  const dbRef = requireDb()
  const daysRef = collection(dbRef, 'days')
  const daysQuery = query(daysRef, where('programId', '==', programId))
  const snapshot = await getDocs(daysQuery)

  return snapshot.docs.map((entry) => {
    const data = entry.data() as { programId: string; date: string; exercises?: Exercise[] }

    return {
      id: entry.id,
      programId: data.programId,
      date: data.date,
      exercises: data.exercises ?? [],
    }
  })
}

export const getDayById = async (dayId: string): Promise<DayPlan | null> => {
  if (isLocalDay(dayId) || !db) {
    const state = readLocalDb()
    return state.days.find((day) => day.id === dayId) ?? null
  }

  const dbRef = requireDb()
  const snap = await getDoc(doc(dbRef, 'days', dayId))

  if (!snap.exists()) {
    return null
  }

  const data = snap.data() as { programId: string; date: string; exercises?: Exercise[] }

  return {
    id: snap.id,
    programId: data.programId,
    date: data.date,
    exercises: data.exercises ?? [],
  }
}

export const upsertDayExercises = async (programId: string, date: string, exercises: Exercise[]) => {
  const safeExercises = sanitizeExercisesForWrite(exercises)

  if (isLocalProgram(programId) || !db) {
    const state = readLocalDb()
    const existingIndex = state.days.findIndex((day) => day.programId === programId && day.date === date)

    if (existingIndex === -1) {
      state.days.push({
        id: createLocalId('local_day'),
        programId,
        date,
        exercises: safeExercises,
      })
    } else {
      state.days[existingIndex] = {
        ...state.days[existingIndex],
        exercises: safeExercises,
      }
    }

    writeLocalDb(state)
    return
  }

  const dbRef = requireDb()
  const daysRef = collection(dbRef, 'days')
  const dayQuery = query(daysRef, where('programId', '==', programId), where('date', '==', date))
  const snapshot = await getDocs(dayQuery)

  if (snapshot.empty) {
    await addDoc(daysRef, {
      programId,
      date,
      exercises: safeExercises,
    })
    return
  }

  const targetDoc = snapshot.docs[0]

  await updateDoc(doc(dbRef, 'days', targetDoc.id), {
    exercises: safeExercises,
  })
}

export const duplicateDayExercises = async (programId: string, sourceDate: string, targetDate: string) => {
  if (isLocalProgram(programId) || !db) {
    const state = readLocalDb()
    const source = state.days.find((day) => day.programId === programId && day.date === sourceDate)

    if (!source) {
      return
    }

    const copiedExercises = source.exercises.map((exercise) => ({
      ...exercise,
      id: crypto.randomUUID(),
    }))

    await upsertDayExercises(programId, targetDate, copiedExercises)
    return
  }

  const dbRef = requireDb()
  const daysRef = collection(dbRef, 'days')
  const dayQuery = query(daysRef, where('programId', '==', programId), where('date', '==', sourceDate))
  const snapshot = await getDocs(dayQuery)

  if (snapshot.empty) {
    return
  }

  const source = snapshot.docs[0].data() as { exercises?: Exercise[] }
  const copiedExercises = (source.exercises ?? []).map((exercise) => ({
    ...exercise,
    id: crypto.randomUUID(),
  }))

  await upsertDayExercises(programId, targetDate, copiedExercises)
}

export const deleteExerciseFromDay = async (dayId: string, exerciseId: string) => {
  if (isLocalDay(dayId) || !db) {
    const state = readLocalDb()
    const day = state.days.find((entry) => entry.id === dayId)

    if (!day) {
      return
    }

    day.exercises = day.exercises.filter((exercise) => exercise.id !== exerciseId)
    writeLocalDb(state)
    return
  }

  const dbRef = requireDb()
  const target = await getDayById(dayId)

  if (!target) {
    return
  }

  const nextExercises = target.exercises.filter((exercise) => exercise.id !== exerciseId)
  await updateDoc(doc(dbRef, 'days', dayId), {
    exercises: nextExercises,
  })
}

export const saveWorkoutLog = async (payload: {
  userId: string
  programId: string
  date: string
  completedExercises: number
  duration: number
}) => {
  if (shouldUseLocalForUser(payload.userId) || isLocalProgram(payload.programId)) {
    const state = readLocalDb()
    state.workoutLogs.push({
      id: createLocalId('local_log'),
      userId: payload.userId,
      programId: payload.programId,
      date: payload.date,
      completedExercises: payload.completedExercises,
      duration: payload.duration,
      createdAt: new Date(),
    })
    writeLocalDb(state)
    return
  }

  const dbRef = requireDb()
  const workoutLogsRef = collection(dbRef, 'workoutLogs')
  await addDoc(workoutLogsRef, {
    ...payload,
    createdAt: serverTimestamp(),
  })
}

export const getWorkoutLogsByUser = async (userId: string): Promise<WorkoutLog[]> => {
  if (shouldUseLocalForUser(userId)) {
    const state = readLocalDb()
    return state.workoutLogs.filter((log) => log.userId === userId)
  }

  const dbRef = requireDb()
  const workoutLogsRef = collection(dbRef, 'workoutLogs')
  const logsQuery = query(workoutLogsRef, where('userId', '==', userId))
  const snapshot = await getDocs(logsQuery)

  return snapshot.docs.map((entry) => {
    const data = entry.data() as {
      userId: string
      programId: string
      date: string
      completedExercises: number
      duration: number
      createdAt?: { toDate: () => Date }
    }

    return {
      id: entry.id,
      userId: data.userId,
      programId: data.programId,
      date: data.date,
      completedExercises: data.completedExercises,
      duration: data.duration,
      createdAt: data.createdAt?.toDate(),
    }
  })
}

export const deleteProgramById = async (programId: string) => {
  if (isLocalProgram(programId) || !db) {
    const state = readLocalDb()
    state.programs = state.programs.filter((program) => program.id !== programId)
    state.days = state.days.filter((day) => day.programId !== programId)
    state.workoutLogs = state.workoutLogs.filter((log) => log.programId !== programId)
    writeLocalDb(state)
    return
  }

  const dbRef = requireDb()
  const daysRef = collection(dbRef, 'days')
  const daysQuery = query(daysRef, where('programId', '==', programId))
  const daySnapshot = await getDocs(daysQuery)

  await Promise.all(daySnapshot.docs.map((entry) => deleteDoc(doc(dbRef, 'days', entry.id))))
  await deleteDoc(doc(dbRef, 'programs', programId))
}
