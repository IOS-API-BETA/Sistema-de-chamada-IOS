'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Users, GraduationCap, CheckCircle, XCircle, FileText, School, Settings, UserPlus, Building2, BookOpen, FileBarChart, Database, Download, Upload, Trash2, Save, RefreshCw, Edit, Check, X, UserCheck, Key, AlertCircle, Clock, User, CalendarDays, Upload as UploadIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function App() {
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '', userType: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', cpf: '', password: '', role: '', unit_id: '' })
  const [resetForm, setResetForm] = useState({ email: '' })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showRegister, setShowRegister] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingUnit, setEditingUnit] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editingClass, setEditingClass] = useState(null)
  
  // Attendance states
  const [selectedClass, setSelectedClass] = useState(null)
  const [attendanceSession, setAttendanceSession] = useState(null)
  const [attendanceData, setAttendanceData] = useState({})
  const [classObservations, setClassObservations] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('12:00')
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({})
  const [users, setUsers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [units, setUnits] = useState([])
  const [courses, setCourses] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  
  // Form states
  const [userForm, setUserForm] = useState({ name: '', email: '', cpf: '', password: '', role: '', unit_id: '' })
  const [unitForm, setUnitForm] = useState({ name: '', address: '', phone: '' })
  const [courseForm, setCourseForm] = useState({ name: '', description: '', duration: '', unit_id: '' })
  const [classForm, setClassForm] = useState({ name: '', unit_id: '', course_id: '', instructor_id: '', year: '2025', semester: '1' })
  const [studentForm, setStudentForm] = useState({ name: '', cpf: '', class_id: '' })
  
  const { toast } = useToast()

  // Sample admin credentials
  const adminCredentials = [
    { email: 'admin@ios.org.br', password: 'admin123', role: 'admin' },
    { email: 'instrutor@ios.org.br', password: 'inst123', role: 'instrutor' },
    { email: 'pedagogo@ios.org.br', password: 'ped123', role: 'pedagogo' },
    { email: 'monitor@ios.org.br', password: 'mon123', role: 'monitor' }
  ]

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ios-user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      if (parsedUser.role === 'admin') {
        loadDashboardData()
      } else {
        loadInstructorData()
      }
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Check admin credentials first
      const adminCred = adminCredentials.find(cred => 
        cred.email === loginForm.email && cred.password === loginForm.password
      )
      
      if (adminCred) {
        const userData = {
          id: adminCred.email,
          name: adminCred.role === 'admin' ? 'Administrador Master' : 
                adminCred.role === 'instrutor' ? 'Instrutor João' :
                adminCred.role === 'pedagogo' ? 'Pedagogo Ana' : 'Monitor Carlos',
          email: adminCred.email,
          role: adminCred.role,
          unit: 'Unidade São Paulo',
          unit_id: 'unit1'
        }
        
        setUser(userData)
        localStorage.setItem('ios-user', JSON.stringify(userData))
        
        if (userData.role === 'admin') {
          setActiveTab('dashboard')
          loadDashboardData()
        } else {
          setActiveTab('attendance')
          loadInstructorData()
        }
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${userData.name}`,
        })
      } else {
        // Try backend login for regular users
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setUser(data.user)
          localStorage.setItem('ios-user', JSON.stringify(data.user))
          setActiveTab('attendance')
          loadInstructorData()
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${data.user.name}`,
          })
        } else {
          throw new Error(data.error || "Credenciais inválidas")
        }
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Aguarde a aprovação do administrador para acessar o sistema",
        })
        setRegisterForm({ name: '', email: '', cpf: '', password: '', role: '', unit_id: '' })
        setShowRegister(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Senha resetada com sucesso!",
          description: `Nova senha temporária: ${data.tempPassword}`,
        })
        setResetForm({ email: '' })
        setShowReset(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao resetar senha",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      // Load all data for dashboard
      const responses = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/users'),
        fetch('/api/users/pending'),
        fetch('/api/units'),
        fetch('/api/courses'),
        fetch('/api/classes'),
        fetch('/api/students')
      ])
      
      const [statsRes, usersRes, pendingRes, unitsRes, coursesRes, classesRes, studentsRes] = responses
      
      if (statsRes.ok) {
        const stats = await statsRes.json()
        setDashboardStats(stats)
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }
      
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingUsers(pendingData.users || [])
      }
      
      if (unitsRes.ok) {
        const unitsData = await unitsRes.json()
        setUnits(unitsData.units || [])
      }
      
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.courses || [])
      }
      
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        setClasses(classesData.classes || [])
      }
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData.students || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const loadInstructorData = async () => {
    try {
      const responses = await Promise.all([
        fetch('/api/units'),
        fetch('/api/courses'),
        fetch('/api/classes'),
        fetch('/api/students')
      ])
      
      const [unitsRes, coursesRes, classesRes, studentsRes] = responses
      
      if (unitsRes.ok) {
        const unitsData = await unitsRes.json()
        setUnits(unitsData.units || [])
      }
      
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.courses || [])
      }
      
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        setClasses(classesData.classes || [])
      }
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData.students || [])
      }
    } catch (error) {
      console.error('Error loading instructor data:', error)
    }
  }

  // Attendance functions
  const openAttendance = async (classItem) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/classes/${classItem.id}/students`)
      const data = await response.json()
      
      if (response.ok) {
        setSelectedClass(classItem)
        setStudents(data.students)
        
        // Initialize attendance data with all students present
        const initialAttendance = {}
        data.students.forEach(student => {
          initialAttendance[student.id] = {
            present: student.status !== 'desistente',
            justified: false,
            observation: '',
            certificate: null
          }
        })
        setAttendanceData(initialAttendance)
        
        // Create attendance session
        setAttendanceSession({
          classId: classItem.id,
          date: attendanceDate,
          startTime,
          endTime,
          instructor: user.name
        })
        
        setActiveTab('call')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAttendance = (studentId, field, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (studentId, file) => {
    // In production, upload to proper file storage
    const fileUrl = URL.createObjectURL(file)
    updateAttendance(studentId, 'certificate', {
      name: file.name,
      url: fileUrl,
      type: file.type
    })
  }

  const saveAttendance = async () => {
    if (!attendanceSession) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: attendanceSession.classId,
          date: attendanceSession.date,
          startTime: attendanceSession.startTime,
          endTime: attendanceSession.endTime,
          attendanceData,
          classObservations,
          instructor: user.name
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Chamada salva com sucesso!",
          description: `Frequência registrada para ${students.length} alunos`,
        })
        
        // Return to classes view
        setSelectedClass(null)
        setAttendanceSession(null)
        setAttendanceData({})
        setClassObservations('')
        setActiveTab('attendance')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a chamada",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-frequencia-${new Date().toISOString().split('T')[0]}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: "Relatório gerado com sucesso!",
          description: "O arquivo foi baixado para seu computador",
        })
      } else {
        throw new Error('Erro ao gerar relatório')
      }
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  // Other functions (approval, CRUD operations, etc.) - keeping existing functions
  const approveUser = async (userId) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/users/approve/${userId}`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Usuário aprovado com sucesso!",
          description: "O usuário já pode acessar o sistema",
        })
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao aprovar usuário",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const rejectUser = async (userId) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/users/reject/${userId}`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Usuário rejeitado",
          description: "O cadastro foi removido do sistema",
        })
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao rejeitar usuário",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Usuário criado com sucesso!",
          description: `${userForm.name} foi adicionado ao sistema`,
        })
        setUserForm({ name: '', email: '', cpf: '', password: '', role: '', unit_id: '' })
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Usuário atualizado com sucesso!",
          description: `${editingUser.name} foi atualizado`,
        })
        setEditingUser(null)
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Usuário excluído com sucesso!",
          description: "O usuário foi removido do sistema",
        })
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createUnit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Unidade criada com sucesso!",
          description: `${unitForm.name} foi adicionada ao sistema`,
        })
        setUnitForm({ name: '', address: '', phone: '' })
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao criar unidade",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUnit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/units/${editingUnit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUnit)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Unidade atualizada com sucesso!",
          description: `${editingUnit.name} foi atualizada`,
        })
        setEditingUnit(null)
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar unidade",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createCourse = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Curso criado com sucesso!",
          description: `${courseForm.name} foi adicionado ao sistema`,
        })
        setCourseForm({ name: '', description: '', duration: '', unit_id: '' })
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao criar curso",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCourse = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCourse)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Curso atualizado com sucesso!",
          description: `${editingCourse.name} foi atualizado`,
        })
        setEditingCourse(null)
        loadDashboardData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar curso",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createClass = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const cycle = `${classForm.semester}º/${classForm.year}`
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...classForm,
          cycle
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Turma criada com sucesso!",
          description: `${classForm.name} foi adicionada ao sistema`,
        })
        setClassForm({ name: '', unit_id: '', course_id: '', instructor_id: '', year: '2025', semester: '1' })
        if (user.role === 'admin') {
          loadDashboardData()
        } else {
          loadInstructorData()
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao criar turma",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateClass = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClass)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Turma atualizada com sucesso!",
          description: `${editingClass.name} foi atualizada`,
        })
        setEditingClass(null)
        if (user.role === 'admin') {
          loadDashboardData()
        } else {
          loadInstructorData()
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar turma",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createStudent = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Estudante adicionado com sucesso!",
          description: `${studentForm.name} foi adicionado à turma`,
        })
        setStudentForm({ name: '', cpf: '', class_id: '' })
        if (user.role === 'admin') {
          loadDashboardData()
        } else {
          loadInstructorData()
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar estudante",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportBackup = async () => {
    try {
      const response = await fetch('/api/backup/export')
      const data = await response.json()
      
      if (response.ok) {
        const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ios-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: "Backup exportado com sucesso!",
          description: "O arquivo foi baixado para seu computador",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao exportar backup",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const logout = () => {
    setUser(null)
    setSelectedClass(null)
    setStudents([])
    setAttendanceData({})
    setActiveTab('dashboard')
    localStorage.removeItem('ios-user')
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-orange-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <School className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-800">Sistema de Chamada</CardTitle>
            <CardDescription>Instituto da Oportunidade Social</CardDescription>
          </CardHeader>
          <CardContent>
            {!showRegister && !showReset ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@ios.org.br"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">ou</span>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setShowRegister(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Primeiro Acesso
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setShowReset(true)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Esqueci minha senha
                  </Button>
                </div>
              </form>
            ) : showRegister ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regName">Nome Completo</Label>
                  <Input
                    id="regName"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regCPF">CPF</Label>
                  <Input
                    id="regCPF"
                    value={registerForm.cpf}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, cpf: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regEmail">Email Institucional</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regPassword">Senha Temporária</Label>
                  <Input
                    id="regPassword"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regRole">Tipo de Usuário</Label>
                  <Select value={registerForm.role} onValueChange={(value) => setRegisterForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instrutor">Instrutor</SelectItem>
                      <SelectItem value="pedagogo">Pedagogo</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regUnit">Unidade</Label>
                  <Select value={registerForm.unit_id} onValueChange={(value) => setRegisterForm(prev => ({ ...prev, unit_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit1">Unidade São Paulo</SelectItem>
                      <SelectItem value="unit2">Unidade Rio de Janeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowRegister(false)}>
                    Voltar
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="seu.email@ios.org.br"
                    value={resetForm.email}
                    onChange={(e) => setResetForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={loading}>
                    {loading ? 'Enviando...' : 'Resetar Senha'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowReset(false)}>
                    Voltar
                  </Button>
                </div>
              </form>
            )}
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Usuários de Teste:</p>
              <div className="text-xs space-y-1 text-gray-600">
                <p><strong>Admin:</strong> admin@ios.org.br / admin123</p>
                <p><strong>Instrutor:</strong> instrutor@ios.org.br / inst123</p>
                <p><strong>Pedagogo:</strong> pedagogo@ios.org.br / ped123</p>
                <p><strong>Monitor:</strong> monitor@ios.org.br / mon123</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  // Attendance Call Interface
  if (attendanceSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <School className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Registro de Frequência</h1>
                  <p className="text-sm text-gray-500">{selectedClass?.name} - {selectedClass?.course}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => {
                  setAttendanceSession(null)
                  setSelectedClass(null)
                  setAttendanceData({})
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Class Info Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-gray-500">Curso</p>
                    <p className="font-medium">{selectedClass?.course}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-gray-500">Turma</p>
                    <p className="font-medium">{selectedClass?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-gray-500">Data</p>
                    <p className="font-medium">{new Date(attendanceSession.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-gray-500">Horário</p>
                    <p className="font-medium">{attendanceSession.startTime} - {attendanceSession.endTime}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Students Attendance Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lista de Chamada ({students.length} alunos)</CardTitle>
              <CardDescription>
                Todos os alunos começam marcados como "Presente". Desmarque apenas quem faltou.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">ID/CPF</th>
                      <th className="text-left p-3">Nome do Aluno</th>
                      <th className="text-center p-3">Presente</th>
                      <th className="text-center p-3">Falta Justificada</th>
                      <th className="text-center p-3">Atestado</th>
                      <th className="text-left p-3">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const attendance = attendanceData[student.id] || {}
                      const isDropout = student.status === 'desistente'
                      
                      return (
                        <tr key={student.id} className={`border-b ${isDropout ? 'bg-gray-100' : ''}`}>
                          <td className="p-3 text-sm font-mono">{student.cpf}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{student.name}</p>
                              {isDropout && <p className="text-xs text-red-500">DESISTENTE</p>}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Checkbox
                              checked={attendance.present || false}
                              disabled={isDropout}
                              onCheckedChange={(checked) => updateAttendance(student.id, 'present', checked)}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <Checkbox
                              checked={attendance.justified || false}
                              disabled={isDropout || attendance.present}
                              onCheckedChange={(checked) => updateAttendance(student.id, 'justified', checked)}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                id={`file-${student.id}`}
                                disabled={isDropout || attendance.present}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleFileUpload(student.id, file)
                                }}
                              />
                              <label
                                htmlFor={`file-${student.id}`}
                                className={`cursor-pointer p-1 rounded ${
                                  isDropout || attendance.present 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-purple-600 hover:bg-purple-50'
                                }`}
                              >
                                <UploadIcon className="h-4 w-4" />
                              </label>
                              {attendance.certificate && (
                                <span className="text-xs text-green-600">✓</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Input
                              value={attendance.observation || ''}
                              disabled={isDropout}
                              placeholder="Observação..."
                              className="w-full text-sm"
                              onChange={(e) => updateAttendance(student.id, 'observation', e.target.value)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Class Observations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Observações da Aula</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={classObservations}
                onChange={(e) => setClassObservations(e.target.value)}
                placeholder="Digite observações gerais sobre a aula..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => {
              setAttendanceSession(null)
              setSelectedClass(null)
              setAttendanceData({})
            }}>
              Cancelar
            </Button>
            <Button onClick={saveAttendance} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? 'Salvando...' : 'Salvar e Retornar'}
            </Button>
            <Button onClick={saveAttendance} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Encerrando...' : 'Encerrar Frequência'}
            </Button>
          </div>
        </div>
        
        <Toaster />
      </div>
    )
  }

  // Admin Dashboard - COMPLETE IMPLEMENTATION
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <School className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sistema de Chamada - IOS</h1>
                  <p className="text-sm text-gray-500">Painel Administrativo</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Administrador Master</p>
                </div>
                <Button variant="outline" onClick={logout}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Unidades</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Cursos</span>
              </TabsTrigger>
              <TabsTrigger value="classes" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Turmas</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileBarChart className="h-4 w-4" />
                <span>Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Backup</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unidades</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{units.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Turmas</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{classes.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{students.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Presenças Hoje</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.todayAttendance || 0}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Sistema</CardTitle>
                    <CardDescription>
                      Use o menu acima para navegar entre as funcionalidades.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total de Usuários:</span>
                      <Badge variant="secondary">{users.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cadastros Pendentes:</span>
                      <Badge variant={pendingUsers.length > 0 ? "destructive" : "secondary"}>
                        {pendingUsers.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cursos Ativos:</span>
                      <Badge variant="secondary">{courses.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status do Sistema:</span>
                      <Badge className="bg-green-500">Online</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>
                      Acesso rápido às funcionalidades mais utilizadas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('users')}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Cadastrar Usuário
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('units')}>
                      <Building2 className="mr-2 h-4 w-4" />
                      Nova Unidade
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('reports')}>
                      <FileBarChart className="mr-2 h-4 w-4" />
                      Relatórios
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={exportBackup}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Backup
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Pending Users Section */}
              {pendingUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5 text-orange-500" />
                      <span>Cadastros Pendentes de Aprovação</span>
                      <Badge variant="destructive">{pendingUsers.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingUsers.map((pendingUser) => (
                        <div key={pendingUser.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                          <div>
                            <h4 className="font-medium">{pendingUser.name}</h4>
                            <p className="text-sm text-gray-600">{pendingUser.email} - {pendingUser.role}</p>
                            <p className="text-xs text-gray-500">CPF: {pendingUser.cpf} | Unidade: {pendingUser.unit}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => approveUser(pendingUser.id)} className="bg-green-500 hover:bg-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectUser(pendingUser.id)}>
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Cadastrar Novo Usuário</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createUser} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Nome Completo</Label>
                      <Input
                        id="userName"
                        value={userForm.name}
                        onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userCPF">CPF</Label>
                      <Input
                        id="userCPF"
                        value={userForm.cpf}
                        onChange={(e) => setUserForm(prev => ({ ...prev, cpf: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPassword">Senha Temporária</Label>
                      <Input
                        id="userPassword"
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Tipo de Usuário</Label>
                      <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador Master</SelectItem>
                          <SelectItem value="instrutor">Instrutor</SelectItem>
                          <SelectItem value="pedagogo">Pedagogo</SelectItem>
                          <SelectItem value="monitor">Monitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userUnit">Unidade</Label>
                      <Select value={userForm.unit_id} onValueChange={(value) => setUserForm(prev => ({ ...prev, unit_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usuários Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nome</th>
                          <th className="text-left p-2">CPF</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-left p-2">Unidade</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b">
                            <td className="p-2">{user.name}</td>
                            <td className="p-2">{user.cpf}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.role}</td>
                            <td className="p-2">{user.unit || 'N/A'}</td>
                            <td className="p-2">
                              <Badge className="bg-green-500">{user.status || 'Ativo'}</Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => deleteUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Units Tab */}
            <TabsContent value="units" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Cadastrar Nova Unidade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createUnit} className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="unitName">Nome da Unidade</Label>
                      <Input
                        id="unitName"
                        value={unitForm.name}
                        onChange={(e) => setUnitForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitAddress">Endereço</Label>
                      <Input
                        id="unitAddress"
                        value={unitForm.address}
                        onChange={(e) => setUnitForm(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPhone">Telefone</Label>
                      <Input
                        id="unitPhone"
                        value={unitForm.phone}
                        onChange={(e) => setUnitForm(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar Unidade'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unidades Cadastradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Unidade</th>
                          <th className="text-left p-2">Telefone</th>
                          <th className="text-left p-2">Cursos & Turmas</th>
                          <th className="text-left p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {units.map(unit => (
                          <tr key={unit.id} className="border-b">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{unit.name}</p>
                                <p className="text-sm text-gray-500">{unit.address}</p>
                              </div>
                            </td>
                            <td className="p-2">{unit.phone}</td>
                            <td className="p-2">
                              {courses.filter(c => c.unit_id === unit.id).length} cursos
                            </td>
                            <td className="p-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingUnit(unit)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Cadastrar Novo Curso</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createCourse} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="courseName">Nome do Curso</Label>
                      <Input
                        id="courseName"
                        value={courseForm.name}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseDuration">Duração (horas)</Label>
                      <Input
                        id="courseDuration"
                        type="number"
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="courseDescription">Descrição</Label>
                      <Textarea
                        id="courseDescription"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseUnit">Unidade</Label>
                      <Select value={courseForm.unit_id} onValueChange={(value) => setCourseForm(prev => ({ ...prev, unit_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade..." />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar Curso'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cursos Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nome do Curso</th>
                          <th className="text-left p-2">Unidade</th>
                          <th className="text-left p-2">Duração</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Turmas</th>
                          <th className="text-left p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map(course => (
                          <tr key={course.id} className="border-b">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{course.name}</p>
                                <p className="text-sm text-gray-500">{course.description}</p>
                              </div>
                            </td>
                            <td className="p-2">{units.find(u => u.id === course.unit_id)?.name}</td>
                            <td className="p-2">{course.duration}h</td>
                            <td className="p-2">
                              <Badge className="bg-green-500">Ativo</Badge>
                            </td>
                            <td className="p-2">
                              {classes.filter(c => c.course_id === course.id).length}
                            </td>
                            <td className="p-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingCourse(course)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Gerenciar Turmas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-medium">Criar Nova Turma</h3>
                      <form onSubmit={createClass} className="space-y-3">
                        <Input 
                          placeholder="Nome da Turma"
                          value={classForm.name}
                          onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                        <Select value={classForm.unit_id} onValueChange={(value) => setClassForm(prev => ({ ...prev, unit_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione unidade..." />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map(unit => (
                              <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={classForm.course_id} onValueChange={(value) => setClassForm(prev => ({ ...prev, course_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um curso..." />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.filter(c => c.unit_id === classForm.unit_id).map(course => (
                              <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input 
                          placeholder="Email do Instrutor"
                          value={classForm.instructor_id}
                          onChange={(e) => setClassForm(prev => ({ ...prev, instructor_id: e.target.value }))}
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={classForm.year} onValueChange={(value) => setClassForm(prev => ({ ...prev, year: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024">2024</SelectItem>
                              <SelectItem value="2025">2025</SelectItem>
                              <SelectItem value="2026">2026</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={classForm.semester} onValueChange={(value) => setClassForm(prev => ({ ...prev, semester: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Semestre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1º Semestre</SelectItem>
                              <SelectItem value="2">2º Semestre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Criando...' : 'Cadastrar Turma'}
                        </Button>
                      </form>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Adicionar Estudante</h3>
                      <form onSubmit={createStudent} className="space-y-3">
                        <Select value={studentForm.class_id} onValueChange={(value) => setStudentForm(prev => ({ ...prev, class_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma turma" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map(cls => (
                              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input 
                          placeholder="Nome do Estudante"
                          value={studentForm.name}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                        <Input 
                          placeholder="CPF"
                          value={studentForm.cpf}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, cpf: e.target.value }))}
                          required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Adicionando...' : 'Adicionar Estudante'}
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Turmas Cadastradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Turma</th>
                          <th className="text-left p-2">Unidade</th>
                          <th className="text-left p-2">Instrutor</th>
                          <th className="text-left p-2">Ciclo</th>
                          <th className="text-left p-2">Estudantes</th>
                          <th className="text-left p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map(cls => (
                          <tr key={cls.id} className="border-b">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{cls.name}</p>
                                <p className="text-sm text-gray-500">{cls.course}</p>
                              </div>
                            </td>
                            <td className="p-2">{cls.unit}</td>
                            <td className="p-2">{cls.instructor_id}</td>
                            <td className="p-2">{cls.cycle}</td>
                            <td className="p-2">
                              {students.filter(s => s.class_id === cls.id).length}
                            </td>
                            <td className="p-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingClass(cls)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileBarChart className="h-5 w-5" />
                    <span>Relatórios de Presença</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as unidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as unidades</SelectItem>
                        {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as turmas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as turmas</SelectItem>
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input type="date" placeholder="Data Inicial" />
                    <Input type="date" placeholder="Data Final" />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={generateReport}>Gerar Relatório</Button>
                    <Button variant="outline" onClick={generateReport}>Exportar para Excel</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup Tab */}
            <TabsContent value="backup" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <span>Backup & Restore</span>
                    </CardTitle>
                    <CardDescription>
                      Faça backup de todos os dados ou restaure de um arquivo anterior.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button className="w-full" onClick={exportBackup}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Backup
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Importar Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ações Administrativas</CardTitle>
                    <CardDescription>
                      ⚠️ CUIDADO: Estas ações são irreversíveis!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Limpar Todos os Dados
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Agora
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar Dados
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Auto-save: <Badge className="bg-green-500">Ativo</Badge></h4>
                      <p className="text-sm text-gray-500 mb-4">Total de registros:</p>
                      <div className="space-y-1 text-sm">
                        <p>Usuários: {users.length}</p>
                        <p>Unidades: {units.length}</p>
                        <p>Cursos: {courses.length}</p>
                        <p>Turmas: {classes.length}</p>
                        <p>Estudantes: {students.length}</p>
                        <p>Registros de presença: 0</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Sobre o Armazenamento</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>✅ Dados persistem entre sessões</p>
                        <p>✅ Salvamento automático ativo</p>
                        <p>✅ Funciona offline</p>
                        <p>⚠️ Dados ficam apenas neste computador</p>
                        <p>⚠️ Backup recomendado regularmente</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Edit User Dialog */}
        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Faça alterações nos dados do usuário.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={updateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Usuário</Label>
                  <Select value={editingUser.role} onValueChange={(value) => setEditingUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador Master</SelectItem>
                      <SelectItem value="instrutor">Instrutor</SelectItem>
                      <SelectItem value="pedagogo">Pedagogo</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select value={editingUser.unit_id} onValueChange={(value) => setEditingUser(prev => ({ ...prev, unit_id: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Unit Dialog */}
        {editingUnit && (
          <Dialog open={!!editingUnit} onOpenChange={() => setEditingUnit(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Unidade</DialogTitle>
                <DialogDescription>
                  Faça alterações nos dados da unidade.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={updateUnit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Unidade</Label>
                  <Input
                    value={editingUnit.name}
                    onChange={(e) => setEditingUnit(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={editingUnit.address}
                    onChange={(e) => setEditingUnit(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={editingUnit.phone}
                    onChange={(e) => setEditingUnit(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingUnit(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Course Dialog */}
        {editingCourse && (
          <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Curso</DialogTitle>
                <DialogDescription>
                  Faça alterações nos dados do curso.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={updateCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Curso</Label>
                  <Input
                    value={editingCourse.name}
                    onChange={(e) => setEditingCourse(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração (horas)</Label>
                  <Input
                    type="number"
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse(prev => ({ ...prev, duration: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Class Dialog */}
        {editingClass && (
          <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Turma</DialogTitle>
                <DialogDescription>
                  Faça alterações nos dados da turma.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={updateClass} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Turma</Label>
                  <Input
                    value={editingClass.name}
                    onChange={(e) => setEditingClass(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email do Instrutor</Label>
                  <Input
                    value={editingClass.instructor_id}
                    onChange={(e) => setEditingClass(prev => ({ ...prev, instructor_id: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciclo</Label>
                  <Input
                    value={editingClass.cycle}
                    onChange={(e) => setEditingClass(prev => ({ ...prev, cycle: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingClass(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
        
        <Toaster />
      </div>
    )
  }

  // Instructor/Pedagogo/Monitor Interface with Attendance
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <School className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Chamada - IOS</h1>
                <p className="text-sm text-gray-500">Instituto da Oportunidade Social</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role} - {user.unit}</p>
              </div>
              <Button variant="outline" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Fazer Chamada</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Gerenciar</span>
            </TabsTrigger>
          </TabsList>

          {/* Attendance Tab with "Open Call" functionality */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Suas Turmas</span>
                </CardTitle>
                <CardDescription>
                  Selecione uma turma para abrir a chamada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {classes
                    .filter(cls => cls.instructor_id === user.email)
                    .map((classItem) => (
                    <Card key={classItem.id} className="border-2 hover:border-purple-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{classItem.name}</h3>
                          <Badge variant="secondary">{classItem.period}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Curso:</strong> {classItem.course}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Unidade:</strong> {classItem.unit}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Ciclo:</strong> {classItem.cycle}
                        </p>
                        <div className="text-sm text-gray-500 mb-4">
                          <strong>Estudantes:</strong> {students.filter(s => s.class_id === classItem.id).length}
                        </div>
                        
                        {/* Date and Time Configuration */}
                        <div className="space-y-2 mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Data</Label>
                              <Input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Início</Label>
                              <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Término</Label>
                            <Input
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="text-xs"
                            />
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => openAttendance(classItem)}
                          disabled={loading}
                        >
                          {loading ? 'Abrindo...' : 'Abrir Chamada'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {classes.filter(cls => cls.instructor_id === user.email).length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Nenhuma turma vinculada</AlertTitle>
                    <AlertDescription>
                      Você ainda não possui turmas vinculadas à sua conta. Entre em contato com o administrador ou crie uma nova turma.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab with semester support */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Criar Nova Turma</span>
                  </CardTitle>
                  <CardDescription>
                    Crie turmas para os cursos da sua unidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createClass} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome da Turma</Label>
                      <Input 
                        placeholder="Ex: TI - Turma C"
                        value={classForm.name}
                        onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Curso</Label>
                      <Select value={classForm.course_id} onValueChange={(value) => {
                        const course = courses.find(c => c.id === value)
                        setClassForm(prev => ({ 
                          ...prev, 
                          course_id: value,
                          unit_id: course?.unit_id || user.unit_id
                        }))
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um curso..." />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.filter(c => c.unit_id === user.unit_id).map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ano</Label>
                        <Select value={classForm.year} onValueChange={(value) => setClassForm(prev => ({ ...prev, year: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Semestre</Label>
                        <Select value={classForm.semester} onValueChange={(value) => setClassForm(prev => ({ ...prev, semester: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Semestre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1º Semestre</SelectItem>
                            <SelectItem value="2">2º Semestre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <input type="hidden" value={classForm.instructor_id = user.email} />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Criando...' : 'Criar Turma'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Adicionar Estudante</span>
                  </CardTitle>
                  <CardDescription>
                    Cadastre estudantes nas suas turmas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createStudent} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Turma</Label>
                      <Select value={studentForm.class_id} onValueChange={(value) => setStudentForm(prev => ({ ...prev, class_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes
                            .filter(cls => cls.instructor_id === user.email)
                            .map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Nome do Estudante</Label>
                      <Input 
                        placeholder="Nome completo"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input 
                        placeholder="000.000.000-00"
                        value={studentForm.cpf}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, cpf: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Adicionando...' : 'Adicionar Estudante'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Toaster />
    </div>
  )
}