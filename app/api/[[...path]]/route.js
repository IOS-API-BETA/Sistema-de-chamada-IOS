import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Initialize sample data
async function initializeSampleData(db) {
  const users = await db.collection('users').countDocuments()
  
  if (users === 0) {
    // Create sample users
    await db.collection('users').insertMany([
      {
        id: uuidv4(),
        name: 'Professor João Silva',
        email: 'joao@ios.org.br',
        cpf: '123.456.789-00',
        password: '123456', // In production, this should be hashed
        role: 'instrutor',
        unit_id: 'unit1',
        unit: 'Unidade São Paulo',
        status: 'approved'
      },
      {
        id: uuidv4(),
        name: 'Ana Costa',
        email: 'ana@ios.org.br',
        cpf: '234.567.890-11',
        password: '123456',
        role: 'pedagogo',
        unit_id: 'unit1',
        unit: 'Unidade São Paulo',
        status: 'approved'
      }
    ])

    // Create sample units
    await db.collection('units').insertMany([
      {
        id: 'unit1',
        name: 'Unidade São Paulo',
        address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
        phone: '(11) 1234-5678'
      },
      {
        id: 'unit2', 
        name: 'Unidade Rio de Janeiro',
        address: 'Av. Copacabana, 456 - Copacabana, Rio de Janeiro - RJ',
        phone: '(21) 9876-5432'
      }
    ])

    // Create sample courses
    await db.collection('courses').insertMany([
      {
        id: 'course1',
        name: 'Tecnologia da Informação',
        description: 'Curso básico de programação e informática',
        duration: '160',
        unit_id: 'unit1'
      },
      {
        id: 'course2',
        name: 'Extensão',
        description: 'Curso de extensão em habilidades básicas',
        duration: '80',
        unit_id: 'unit1'
      },
      {
        id: 'course3',
        name: 'Administração',
        description: 'Curso de administração e gestão',
        duration: '120',
        unit_id: 'unit2'
      }
    ])

    // Create sample classes
    await db.collection('classes').insertMany([
      {
        id: 'class1',
        name: 'TI - Turma A',
        course_id: 'course1',
        course: 'Tecnologia da Informação',
        instructor_id: 'joao@ios.org.br',
        unit_id: 'unit1',
        unit: 'Unidade São Paulo',
        cycle: '01/2025',
        period: 'manhã'
      },
      {
        id: 'class2',
        name: 'TI - Turma B',
        course_id: 'course1',
        course: 'Tecnologia da Informação',
        instructor_id: 'joao@ios.org.br',
        unit_id: 'unit1',
        unit: 'Unidade São Paulo',
        cycle: '01/2025',
        period: 'manhã'
      },
      {
        id: 'class3',
        name: 'Extensão - Turma A',
        course_id: 'course2',
        course: 'Extensão',
        instructor_id: 'ana@ios.org.br',
        unit_id: 'unit1',
        unit: 'Unidade São Paulo',
        cycle: '01/2025',
        period: 'tarde'
      }
    ])

    // Create sample students
    await db.collection('students').insertMany([
      // Students for TI - Turma A
      {
        id: uuidv4(),
        name: 'Maria Oliveira',
        cpf: '123.456.789-01',
        class_id: 'class1',
        status: 'ativo'
      },
      {
        id: uuidv4(),
        name: 'Pedro Santos',
        cpf: '234.567.890-12',
        class_id: 'class1',
        status: 'ativo'
      },
      {
        id: uuidv4(),
        name: 'Ana Souza',
        cpf: '345.678.901-23',
        class_id: 'class1',
        status: 'ativo'
      },
      {
        id: uuidv4(),
        name: 'Carlos Lima',
        cpf: '456.789.012-34',
        class_id: 'class1',
        status: 'ativo'
      },
      {
        id: uuidv4(),
        name: 'Juliana Costa',
        cpf: '567.890.123-45',
        class_id: 'class1',
        status: 'ativo'
      },
      // Students for TI - Turma B
      {
        id: uuidv4(),
        name: 'Roberto Silva',
        cpf: '678.901.234-56',
        class_id: 'class2',
        status: 'ativo'
      },
      {
        id: uuidv4(),
        name: 'Fernanda Rocha',
        cpf: '789.012.345-67',
        class_id: 'class2',
        status: 'ativo'
      },
      {
        id: uuidv4(),
        name: 'Lucas Pereira',
        cpf: '890.123.456-78',
        class_id: 'class2',
        status: 'ativo'
      },
      // Students for Extensão - Turma A
      {
        id: uuidv4(),
        name: 'Camila Ferreira',
        cpf: '901.234.567-89',
        class_id: 'class3',
        status: 'ativo'
      },
      {
        id: uuidv4(),
        name: 'Diego Almeida',
        cpf: '012.345.678-90',
        class_id: 'class3',
        status: 'ativo'
      }
    ])

    console.log('Sample data initialized successfully')
  }
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()
    
    // Initialize sample data on first run
    await initializeSampleData(db)

    // Health check endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Sistema de Chamada - IOS API" }))
    }

    // AUTH ENDPOINTS
    
    // Login endpoint - POST /api/auth/login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const { email, password } = body
      
      if (!email || !password) {
        return handleCORS(NextResponse.json(
          { error: "Email e senha são obrigatórios" }, 
          { status: 400 }
        ))
      }

      const user = await db.collection('users').findOne({ 
        email: email,
        password: password, // In production, use proper password hashing
        status: 'approved' // Only approved users can login
      })

      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Credenciais inválidas ou usuário não aprovado" }, 
          { status: 401 }
        ))
      }

      // Remove password from response
      const { password: _, _id, ...userResponse } = user

      return handleCORS(NextResponse.json({ 
        user: userResponse,
        message: "Login realizado com sucesso"
      }))
    }

    // Register endpoint - POST /api/auth/register
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json()
      const { name, email, cpf, password, role, unit_id } = body
      
      if (!name || !email || !cpf || !password || !role) {
        return handleCORS(NextResponse.json(
          { error: "Todos os campos são obrigatórios" }, 
          { status: 400 }
        ))
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({
        $or: [{ email }, { cpf }]
      })

      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: "Usuário já existe com este email ou CPF" }, 
          { status: 409 }
        ))
      }

      const unit = unit_id ? await db.collection('units').findOne({ id: unit_id }) : null

      const newUser = {
        id: uuidv4(),
        name,
        email,
        cpf,
        password, // In production, hash this
        role,
        unit_id: unit_id || null,
        unit: unit?.name || null,
        status: 'pending', // New users need approval
        created_at: new Date()
      }

      await db.collection('users').insertOne(newUser)

      const { password: _, _id, ...userResponse } = newUser
      return handleCORS(NextResponse.json({ 
        user: userResponse,
        message: "Cadastro realizado com sucesso! Aguarde aprovação do administrador."
      }))
    }

    // Password reset endpoint - POST /api/auth/reset
    if (route === '/auth/reset' && method === 'POST') {
      const body = await request.json()
      const { email } = body
      
      if (!email) {
        return handleCORS(NextResponse.json(
          { error: "Email é obrigatório" }, 
          { status: 400 }
        ))
      }

      const user = await db.collection('users').findOne({ email, status: 'approved' })

      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Usuário não encontrado ou não aprovado" }, 
          { status: 404 }
        ))
      }

      // Generate new temporary password
      const tempPassword = Math.random().toString(36).slice(-8)
      
      // Update user password and keep approved status
      await db.collection('users').updateOne(
        { email },
        { $set: { 
          password: tempPassword, 
          password_reset: true, 
          status: 'approved', // Ensure status remains approved
          updated_at: new Date() 
        } }
      )

      // In production, send email with temporary password
      // For now, we'll just return it in the response
      return handleCORS(NextResponse.json({ 
        message: "Nova senha temporária gerada com sucesso. Use a senha temporária para fazer login.",
        tempPassword: tempPassword, // Remove this in production
        email: email
      }))
    }

    // DASHBOARD ENDPOINTS
    
    // Dashboard stats - GET /api/dashboard/stats
    if (route === '/dashboard/stats' && method === 'GET') {
      const [unitsCount, classesCount, studentsCount, attendanceToday] = await Promise.all([
        db.collection('units').countDocuments(),
        db.collection('classes').countDocuments(),
        db.collection('students').countDocuments({ status: 'ativo' }),
        db.collection('attendance').countDocuments({ 
          date: new Date().toISOString().split('T')[0] 
        })
      ])

      return handleCORS(NextResponse.json({
        unitsCount,
        classesCount,
        studentsCount,
        todayAttendance: attendanceToday
      }))
    }

    // USERS ENDPOINTS
    
    // Get all approved users - GET /api/users
    if (route === '/users' && method === 'GET') {
      const users = await db.collection('users')
        .find({ status: 'approved' }, { projection: { password: 0 } })
        .toArray()

      const cleanedUsers = users.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ users: cleanedUsers }))
    }

    // Get pending users - GET /api/users/pending
    if (route === '/users/pending' && method === 'GET') {
      const users = await db.collection('users')
        .find({ status: 'pending' }, { projection: { password: 0 } })
        .toArray()

      const cleanedUsers = users.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ users: cleanedUsers }))
    }

    // Approve user - POST /api/users/approve/[userId]
    if (route.match(/^\/users\/approve\/(.+)$/) && method === 'POST') {
      const userId = route.match(/^\/users\/approve\/(.+)$/)[1]
      
      const result = await db.collection('users').updateOne(
        { id: userId },
        { $set: { status: 'approved', approved_at: new Date() } }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: "Usuário não encontrado" }, 
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ 
        message: "Usuário aprovado com sucesso"
      }))
    }

    // Reject user - POST /api/users/reject/[userId]
    if (route.match(/^\/users\/reject\/(.+)$/) && method === 'POST') {
      const userId = route.match(/^\/users\/reject\/(.+)$/)[1]
      
      const result = await db.collection('users').deleteOne({ id: userId })

      if (result.deletedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: "Usuário não encontrado" }, 
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ 
        message: "Usuário rejeitado e removido do sistema"
      }))
    }

    // Create user - POST /api/users
    if (route === '/users' && method === 'POST') {
      const body = await request.json()
      const { name, email, cpf, password, role, unit_id } = body
      
      if (!name || !email || !cpf || !password || !role) {
        return handleCORS(NextResponse.json(
          { error: "Todos os campos são obrigatórios" }, 
          { status: 400 }
        ))
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({
        $or: [{ email }, { cpf }]
      })

      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: "Usuário já existe com este email ou CPF" }, 
          { status: 409 }
        ))
      }

      const unit = unit_id ? await db.collection('units').findOne({ id: unit_id }) : null

      const newUser = {
        id: uuidv4(),
        name,
        email,
        cpf,
        password, // In production, hash this
        role,
        unit_id: unit_id || null,
        unit: unit?.name || null,
        status: 'approved', // Admin created users are auto-approved
        created_at: new Date()
      }

      await db.collection('users').insertOne(newUser)

      const { password: _, _id, ...userResponse } = newUser
      return handleCORS(NextResponse.json({ 
        user: userResponse,
        message: "Usuário criado com sucesso"
      }))
    }

    // Update user - PUT /api/users/[userId]
    if (route.match(/^\/users\/(.+)$/) && method === 'PUT') {
      const userId = route.match(/^\/users\/(.+)$/)[1]
      const body = await request.json()
      const { name, email, role, unit_id } = body
      
      if (!name || !email || !role) {
        return handleCORS(NextResponse.json(
          { error: "Nome, email e role são obrigatórios" }, 
          { status: 400 }
        ))
      }

      const unit = unit_id ? await db.collection('units').findOne({ id: unit_id }) : null

      const result = await db.collection('users').updateOne(
        { id: userId },
        { 
          $set: { 
            name, 
            email, 
            role, 
            unit_id: unit_id || null,
            unit: unit?.name || null,
            updated_at: new Date() 
          } 
        }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: "Usuário não encontrado" }, 
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ 
        message: "Usuário atualizado com sucesso"
      }))
    }

    // Delete user - DELETE /api/users/[userId]
    if (route.match(/^\/users\/(.+)$/) && method === 'DELETE') {
      const userId = route.match(/^\/users\/(.+)$/)[1]
      
      const result = await db.collection('users').deleteOne({ id: userId })

      if (result.deletedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: "Usuário não encontrado" }, 
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ 
        message: "Usuário excluído com sucesso"
      }))
    }

    // UNITS ENDPOINTS
    
    // Get all units - GET /api/units
    if (route === '/units' && method === 'GET') {
      const units = await db.collection('units')
        .find({})
        .toArray()

      const cleanedUnits = units.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ units: cleanedUnits }))
    }

    // Create unit - POST /api/units
    if (route === '/units' && method === 'POST') {
      const body = await request.json()
      const { name, address, phone } = body
      
      if (!name || !address || !phone) {
        return handleCORS(NextResponse.json(
          { error: "Todos os campos são obrigatórios" }, 
          { status: 400 }
        ))
      }

      const newUnit = {
        id: uuidv4(),
        name,
        address,
        phone,
        created_at: new Date()
      }

      await db.collection('units').insertOne(newUnit)

      const { _id, ...unitResponse } = newUnit
      return handleCORS(NextResponse.json({ 
        unit: unitResponse,
        message: "Unidade criada com sucesso"
      }))
    }

    // Update unit - PUT /api/units/[unitId]
    if (route.match(/^\/units\/(.+)$/) && method === 'PUT') {
      const unitId = route.match(/^\/units\/(.+)$/)[1]
      const body = await request.json()
      const { name, address, phone } = body
      
      if (!name || !address || !phone) {
        return handleCORS(NextResponse.json(
          { error: "Todos os campos são obrigatórios" }, 
          { status: 400 }
        ))
      }

      const result = await db.collection('units').updateOne(
        { id: unitId },
        { 
          $set: { 
            name, 
            address, 
            phone, 
            updated_at: new Date() 
          } 
        }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: "Unidade não encontrada" }, 
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ 
        message: "Unidade atualizada com sucesso"
      }))
    }

    // COURSES ENDPOINTS
    
    // Get all courses - GET /api/courses
    if (route === '/courses' && method === 'GET') {
      const courses = await db.collection('courses')
        .find({})
        .toArray()

      const cleanedCourses = courses.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ courses: cleanedCourses }))
    }

    // Create course - POST /api/courses
    if (route === '/courses' && method === 'POST') {
      const body = await request.json()
      const { name, description, duration, unit_id } = body
      
      if (!name || !duration || !unit_id) {
        return handleCORS(NextResponse.json(
          { error: "Nome, duração e unidade são obrigatórios" }, 
          { status: 400 }
        ))
      }

      const newCourse = {
        id: uuidv4(),
        name,
        description: description || '',
        duration,
        unit_id,
        created_at: new Date()
      }

      await db.collection('courses').insertOne(newCourse)

      const { _id, ...courseResponse } = newCourse
      return handleCORS(NextResponse.json({ 
        course: courseResponse,
        message: "Curso criado com sucesso"
      }))
    }

    // Update course - PUT /api/courses/[courseId]
    if (route.match(/^\/courses\/(.+)$/) && method === 'PUT') {
      const courseId = route.match(/^\/courses\/(.+)$/)[1]
      const body = await request.json()
      const { name, description, duration, unit_id } = body
      
      if (!name || !duration) {
        return handleCORS(NextResponse.json(
          { error: "Nome e duração são obrigatórios" }, 
          { status: 400 }
        ))
      }

      const result = await db.collection('courses').updateOne(
        { id: courseId },
        { 
          $set: { 
            name, 
            description: description || '',
            duration,
            unit_id,
            updated_at: new Date() 
          } 
        }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: "Curso não encontrado" }, 
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ 
        message: "Curso atualizado com sucesso"
      }))
    }

    // CLASSES ENDPOINTS
    
    // Get classes - GET /api/classes
    if (route === '/classes' && method === 'GET') {
      const classes = await db.collection('classes')
        .find({})
        .toArray()

      // Remove MongoDB's _id field from response
      const cleanedClasses = classes.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ classes: cleanedClasses }))
    }

    // Create class - POST /api/classes
    if (route === '/classes' && method === 'POST') {
      const body = await request.json()
      const { name, unit_id, course_id, instructor_id, cycle } = body
      
      if (!name || !unit_id || !course_id || !instructor_id || !cycle) {
        return handleCORS(NextResponse.json(
          { error: "Todos os campos são obrigatórios" }, 
          { status: 400 }
        ))
      }

      // Get unit and course info
      const unit = await db.collection('units').findOne({ id: unit_id })
      const course = await db.collection('courses').findOne({ id: course_id })

      if (!unit || !course) {
        return handleCORS(NextResponse.json(
          { error: "Unidade ou curso não encontrado" }, 
          { status: 404 }
        ))
      }

      const newClass = {
        id: uuidv4(),
        name,
        course_id,
        course: course.name,
        instructor_id,
        unit_id,
        unit: unit.name,
        cycle: cycle, // Now supports semester format like "1º/2025"
        period: 'manhã', // Default period
        created_at: new Date()
      }

      await db.collection('classes').insertOne(newClass)

      const { _id, ...classResponse } = newClass
      return handleCORS(NextResponse.json({ 
        class: classResponse,
        message: "Turma criada com sucesso"
      }))
    }

    // Update class - PUT /api/classes/[classId]
    if (route.match(/^\/classes\/(.+)$/) && method === 'PUT') {
      const classId = route.match(/^\/classes\/(.+)$/)[1]
      const body = await request.json()
      const { name, instructor_id, cycle } = body
      
      if (!name || !instructor_id || !cycle) {
        return handleCORS(NextResponse.json(
          { error: "Nome, instrutor e ciclo são obrigatórios" }, 
          { status: 400 }
        ))
      }

      const result = await db.collection('classes').updateOne(
        { id: classId },
        { 
          $set: { 
            name, 
            instructor_id,
            cycle,
            updated_at: new Date() 
          } 
        }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: "Turma não encontrada" }, 
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ 
        message: "Turma atualizada com sucesso"
      }))
    }

    // Get students by class - GET /api/classes/[classId]/students
    if (route.match(/^\/classes\/(.+)\/students$/) && method === 'GET') {
      const classId = route.match(/^\/classes\/(.+)\/students$/)[1]
      
      const students = await db.collection('students')
        .find({ class_id: classId, status: 'ativo' })
        .toArray()

      // Remove MongoDB's _id field from response
      const cleanedStudents = students.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ students: cleanedStudents }))
    }

    // STUDENTS ENDPOINTS
    
    // Get all students - GET /api/students
    if (route === '/students' && method === 'GET') {
      const students = await db.collection('students')
        .find({})
        .toArray()

      // Remove MongoDB's _id field from response
      const cleanedStudents = students.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ students: cleanedStudents }))
    }

    // Create student - POST /api/students
    if (route === '/students' && method === 'POST') {
      const body = await request.json()
      const { name, cpf, class_id } = body
      
      if (!name || !cpf || !class_id) {
        return handleCORS(NextResponse.json(
          { error: "Nome, CPF e turma são obrigatórios" }, 
          { status: 400 }
        ))
      }

      // Check if student already exists
      const existingStudent = await db.collection('students').findOne({ cpf })

      if (existingStudent) {
        return handleCORS(NextResponse.json(
          { error: "Estudante já existe com este CPF" }, 
          { status: 409 }
        ))
      }

      const newStudent = {
        id: uuidv4(),
        name,
        cpf,
        class_id,
        status: 'ativo',
        created_at: new Date()
      }

      await db.collection('students').insertOne(newStudent)

      const { _id, ...studentResponse } = newStudent
      return handleCORS(NextResponse.json({ 
        student: studentResponse,
        message: "Estudante criado com sucesso"
      }))
    }

    // ATTENDANCE ENDPOINTS
    
    // Save attendance - POST /api/attendance
    if (route === '/attendance' && method === 'POST') {
      const body = await request.json()
      const { classId, date, startTime, endTime, attendanceData, classObservations, instructor } = body
      
      if (!classId || !date || !attendanceData) {
        return handleCORS(NextResponse.json(
          { error: "Dados da chamada incompletos" }, 
          { status: 400 }
        ))
      }

      // Create attendance session record
      const attendanceRecord = {
        id: uuidv4(),
        class_id: classId,
        date: date,
        start_time: startTime,
        end_time: endTime,
        instructor: instructor,
        class_observations: classObservations || '',
        created_at: new Date(),
        status: 'closed'
      }

      await db.collection('attendance').insertOne(attendanceRecord)

      // Create individual presence records with enhanced data
      const presenceRecords = Object.entries(attendanceData).map(([studentId, data]) => ({
        id: uuidv4(),
        attendance_id: attendanceRecord.id,
        student_id: studentId,
        present: data.present || false,
        justified: data.justified || false,
        observation: data.observation || '',
        certificate_url: data.certificate?.url || null,
        certificate_name: data.certificate?.name || null,
        created_at: new Date()
      }))

      if (presenceRecords.length > 0) {
        await db.collection('presence').insertMany(presenceRecords)
      }

      return handleCORS(NextResponse.json({ 
        message: "Chamada salva com sucesso",
        attendanceId: attendanceRecord.id,
        recordsCount: presenceRecords.length
      }))
    }

    // Get attendance history - GET /api/attendance
    if (route === '/attendance' && method === 'GET') {
      const attendanceRecords = await db.collection('attendance')
        .find({})
        .sort({ created_at: -1 })
        .limit(50)
        .toArray()

      // Remove MongoDB's _id field from response
      const cleanedRecords = attendanceRecords.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ attendance: cleanedRecords }))
    }

    // REPORTS ENDPOINTS
    
    // Generate report - POST /api/reports/generate
    if (route === '/reports/generate' && method === 'POST') {
      try {
        // Get all data for report
        const [attendanceRecords, presenceRecords, studentsData, classesData, unitsData] = await Promise.all([
          db.collection('attendance').find({}).toArray(),
          db.collection('presence').find({}).toArray(),
          db.collection('students').find({}).toArray(),
          db.collection('classes').find({}).toArray(),
          db.collection('units').find({}).toArray()
        ])

        // Create Excel-like data structure
        const reportData = {
          attendanceRecords: attendanceRecords.map(({ _id, ...rest }) => rest),
          presenceRecords: presenceRecords.map(({ _id, ...rest }) => rest),
          students: studentsData.map(({ _id, ...rest }) => rest),
          classes: classesData.map(({ _id, ...rest }) => rest),
          units: unitsData.map(({ _id, ...rest }) => rest),
          generated_at: new Date().toISOString()
        }

        // Create a simple CSV-like format for Excel
        let csvContent = 'Data,Turma,Curso,Unidade,Aluno,CPF,Status,Observacao,Instrutor\n'
        
        attendanceRecords.forEach(attendance => {
          const classInfo = classesData.find(c => c.id === attendance.class_id)
          const unitInfo = unitsData.find(u => u.id === classInfo?.unit_id)
          
          presenceRecords
            .filter(p => p.attendance_id === attendance.id)
            .forEach(presence => {
              const student = studentsData.find(s => s.id === presence.student_id)
              const status = presence.present ? 'Presente' : (presence.justified ? 'Falta Justificada' : 'Falta')
              
              csvContent += `${attendance.date},${classInfo?.name || ''},${classInfo?.course || ''},${unitInfo?.name || ''},${student?.name || ''},${student?.cpf || ''},${status},"${presence.observation || ''}",${attendance.instructor || ''}\n`
            })
        })

        // Return CSV data
        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="relatorio-frequencia.csv"',
            'Access-Control-Allow-Origin': '*'
          }
        })
      } catch (error) {
        return handleCORS(NextResponse.json(
          { error: "Erro ao gerar relatório", details: error.message }, 
          { status: 500 }
        ))
      }
    }

    // BACKUP ENDPOINTS
    
    // Export backup - GET /api/backup/export
    if (route === '/backup/export' && method === 'GET') {
      const [users, units, courses, classes, students, attendance, presence] = await Promise.all([
        db.collection('users').find({}, { projection: { password: 0 } }).toArray(),
        db.collection('units').find({}).toArray(),
        db.collection('courses').find({}).toArray(),
        db.collection('classes').find({}).toArray(),
        db.collection('students').find({}).toArray(),
        db.collection('attendance').find({}).toArray(),
        db.collection('presence').find({}).toArray()
      ])

      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          users: users.map(({ _id, ...rest }) => rest),
          units: units.map(({ _id, ...rest }) => rest),
          courses: courses.map(({ _id, ...rest }) => rest),
          classes: classes.map(({ _id, ...rest }) => rest),
          students: students.map(({ _id, ...rest }) => rest),
          attendance: attendance.map(({ _id, ...rest }) => rest),
          presence: presence.map(({ _id, ...rest }) => rest)
        }
      }

      return handleCORS(NextResponse.json({ backup }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute