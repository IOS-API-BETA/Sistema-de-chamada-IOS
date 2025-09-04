#!/usr/bin/env python3
"""
Backend API Test Suite for Sistema de Chamada - IOS
Tests all backend endpoints for the attendance system
"""

import requests
import json
import sys
import uuid
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://ios-attendance.preview.emergentagent.com/api"

class AttendanceAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })
        
        if response_data:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
        print()

    def test_health_check(self):
        """Test GET /api/ - Health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if "Sistema de Chamada - IOS API" in data.get('message', ''):
                    self.log_test("Health Check", True, "API is responding correctly", data)
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected message: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_auth_valid_login(self):
        """Test POST /api/auth/login with valid credentials"""
        try:
            payload = {
                "email": "joao@ios.org.br",
                "password": "123456"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and data['user']['email'] == 'joao@ios.org.br':
                    # Verify password is not in response
                    if 'password' not in data['user']:
                        self.log_test("Auth - Valid Login", True, "Login successful with correct user data", data)
                        return True
                    else:
                        self.log_test("Auth - Valid Login", False, "Password exposed in response")
                        return False
                else:
                    self.log_test("Auth - Valid Login", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Auth - Valid Login", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Auth - Valid Login", False, f"Exception: {str(e)}")
            return False

    def test_auth_invalid_login(self):
        """Test POST /api/auth/login with invalid credentials"""
        try:
            payload = {
                "email": "joao@ios.org.br",
                "password": "wrongpassword"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 401:
                data = response.json()
                if 'error' in data:
                    self.log_test("Auth - Invalid Login", True, "Correctly rejected invalid credentials", data)
                    return True
                else:
                    self.log_test("Auth - Invalid Login", False, f"Missing error message: {data}")
                    return False
            else:
                self.log_test("Auth - Invalid Login", False, f"Expected 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Auth - Invalid Login", False, f"Exception: {str(e)}")
            return False

    def test_auth_missing_fields(self):
        """Test POST /api/auth/login with missing email/password"""
        try:
            payload = {
                "email": "joao@ios.org.br"
                # Missing password
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data:
                    self.log_test("Auth - Missing Fields", True, "Correctly rejected missing fields", data)
                    return True
                else:
                    self.log_test("Auth - Missing Fields", False, f"Missing error message: {data}")
                    return False
            else:
                self.log_test("Auth - Missing Fields", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Auth - Missing Fields", False, f"Exception: {str(e)}")
            return False

    def test_get_classes(self):
        """Test GET /api/classes - Get all classes"""
        try:
            response = self.session.get(f"{self.base_url}/classes")
            
            if response.status_code == 200:
                data = response.json()
                if 'classes' in data and isinstance(data['classes'], list):
                    classes = data['classes']
                    if len(classes) > 0:
                        # Verify no _id fields in response
                        has_id_field = any('_id' in cls for cls in classes)
                        if not has_id_field:
                            self.log_test("Get Classes", True, f"Retrieved {len(classes)} classes successfully", data)
                            return True
                        else:
                            self.log_test("Get Classes", False, "MongoDB _id field found in response")
                            return False
                    else:
                        self.log_test("Get Classes", False, "No classes found")
                        return False
                else:
                    self.log_test("Get Classes", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get Classes", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Classes", False, f"Exception: {str(e)}")
            return False

    def test_get_class_students_valid(self):
        """Test GET /api/classes/class1/students - Get students for valid class"""
        try:
            response = self.session.get(f"{self.base_url}/classes/class1/students")
            
            if response.status_code == 200:
                data = response.json()
                if 'students' in data and isinstance(data['students'], list):
                    students = data['students']
                    if len(students) > 0:
                        # Verify no _id fields in response
                        has_id_field = any('_id' in student for student in students)
                        if not has_id_field:
                            self.log_test("Get Class Students - Valid", True, f"Retrieved {len(students)} students for class1", data)
                            return True
                        else:
                            self.log_test("Get Class Students - Valid", False, "MongoDB _id field found in response")
                            return False
                    else:
                        self.log_test("Get Class Students - Valid", True, "No students found for class1 (valid scenario)")
                        return True
                else:
                    self.log_test("Get Class Students - Valid", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get Class Students - Valid", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Class Students - Valid", False, f"Exception: {str(e)}")
            return False

    def test_get_class_students_invalid(self):
        """Test GET /api/classes/invalid/students - Get students for invalid class"""
        try:
            response = self.session.get(f"{self.base_url}/classes/invalid/students")
            
            if response.status_code == 200:
                data = response.json()
                if 'students' in data and isinstance(data['students'], list):
                    students = data['students']
                    if len(students) == 0:
                        self.log_test("Get Class Students - Invalid", True, "Correctly returned empty list for invalid class", data)
                        return True
                    else:
                        self.log_test("Get Class Students - Invalid", False, f"Unexpected students found for invalid class: {len(students)}")
                        return False
                else:
                    self.log_test("Get Class Students - Invalid", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get Class Students - Invalid", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Class Students - Invalid", False, f"Exception: {str(e)}")
            return False

    def test_save_attendance_valid(self):
        """Test POST /api/attendance - Save attendance with valid data"""
        try:
            payload = {
                "classId": "class1",
                "date": "2025-01-15",
                "attendanceData": {
                    "student1": {
                        "status": "presente",
                        "observation": ""
                    },
                    "student2": {
                        "status": "falta",
                        "observation": "Não compareceu"
                    },
                    "student3": {
                        "status": "justificada",
                        "observation": "Atestado médico"
                    }
                }
            }
            
            response = self.session.post(f"{self.base_url}/attendance", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'attendanceId' in data:
                    self.log_test("Save Attendance - Valid", True, "Attendance saved successfully", data)
                    return True
                else:
                    self.log_test("Save Attendance - Valid", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Save Attendance - Valid", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Save Attendance - Valid", False, f"Exception: {str(e)}")
            return False

    def test_save_attendance_missing_fields(self):
        """Test POST /api/attendance - Save attendance with missing fields"""
        try:
            payload = {
                "classId": "class1",
                # Missing date and attendanceData
            }
            
            response = self.session.post(f"{self.base_url}/attendance", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data:
                    self.log_test("Save Attendance - Missing Fields", True, "Correctly rejected missing fields", data)
                    return True
                else:
                    self.log_test("Save Attendance - Missing Fields", False, f"Missing error message: {data}")
                    return False
            else:
                self.log_test("Save Attendance - Missing Fields", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Save Attendance - Missing Fields", False, f"Exception: {str(e)}")
            return False

    def test_get_attendance_history(self):
        """Test GET /api/attendance - Get attendance history"""
        try:
            response = self.session.get(f"{self.base_url}/attendance")
            
            if response.status_code == 200:
                data = response.json()
                if 'attendance' in data and isinstance(data['attendance'], list):
                    attendance_records = data['attendance']
                    # Verify no _id fields in response
                    has_id_field = any('_id' in record for record in attendance_records)
                    if not has_id_field:
                        self.log_test("Get Attendance History", True, f"Retrieved {len(attendance_records)} attendance records", data)
                        return True
                    else:
                        self.log_test("Get Attendance History", False, "MongoDB _id field found in response")
                        return False
                else:
                    self.log_test("Get Attendance History", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get Attendance History", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Attendance History", False, f"Exception: {str(e)}")
            return False

    def test_get_all_students(self):
        """Test GET /api/students - Get all students"""
        try:
            response = self.session.get(f"{self.base_url}/students")
            
            if response.status_code == 200:
                data = response.json()
                if 'students' in data and isinstance(data['students'], list):
                    students = data['students']
                    if len(students) > 0:
                        # Verify no _id fields in response
                        has_id_field = any('_id' in student for student in students)
                        if not has_id_field:
                            self.log_test("Get All Students", True, f"Retrieved {len(students)} students successfully", data)
                            return True
                        else:
                            self.log_test("Get All Students", False, "MongoDB _id field found in response")
                            return False
                    else:
                        self.log_test("Get All Students", False, "No students found")
                        return False
                else:
                    self.log_test("Get All Students", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get All Students", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get All Students", False, f"Exception: {str(e)}")
            return False

    # ========== ADMINISTRATIVE BACKEND TESTS ==========

    def test_auth_admin_roles(self):
        """Test authentication with different user roles"""
        try:
            # Test admin role (using existing user)
            payload = {
                "email": "joao@ios.org.br",
                "password": "123456"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and 'role' in data['user']:
                    role = data['user']['role']
                    valid_roles = ['admin', 'instrutor', 'pedagogo', 'monitor']
                    if role in valid_roles:
                        self.log_test("Auth - Admin Roles", True, f"User has valid role: {role}", data)
                        return True
                    else:
                        self.log_test("Auth - Admin Roles", False, f"Invalid role: {role}")
                        return False
                else:
                    self.log_test("Auth - Admin Roles", False, "Role not found in user data")
                    return False
            else:
                self.log_test("Auth - Admin Roles", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Auth - Admin Roles", False, f"Exception: {str(e)}")
            return False

    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats - Dashboard statistics"""
        try:
            response = self.session.get(f"{self.base_url}/dashboard/stats")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['unitsCount', 'classesCount', 'studentsCount', 'todayAttendance']
                
                if all(field in data for field in required_fields):
                    # Verify all counts are numbers
                    if all(isinstance(data[field], int) for field in required_fields):
                        self.log_test("Dashboard Stats", True, f"Retrieved dashboard stats successfully", data)
                        return True
                    else:
                        self.log_test("Dashboard Stats", False, "Stats contain non-numeric values")
                        return False
                else:
                    missing = [field for field in required_fields if field not in data]
                    self.log_test("Dashboard Stats", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_test("Dashboard Stats", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Exception: {str(e)}")
            return False

    def test_get_users(self):
        """Test GET /api/users - Get all users"""
        try:
            response = self.session.get(f"{self.base_url}/users")
            
            if response.status_code == 200:
                data = response.json()
                if 'users' in data and isinstance(data['users'], list):
                    users = data['users']
                    if len(users) > 0:
                        # Verify no _id or password fields in response
                        has_id_field = any('_id' in user for user in users)
                        has_password_field = any('password' in user for user in users)
                        
                        if not has_id_field and not has_password_field:
                            self.log_test("Get Users", True, f"Retrieved {len(users)} users successfully", data)
                            return True
                        else:
                            issues = []
                            if has_id_field:
                                issues.append("MongoDB _id field found")
                            if has_password_field:
                                issues.append("Password field exposed")
                            self.log_test("Get Users", False, f"Security issues: {', '.join(issues)}")
                            return False
                    else:
                        self.log_test("Get Users", False, "No users found")
                        return False
                else:
                    self.log_test("Get Users", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get Users", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Users", False, f"Exception: {str(e)}")
            return False

    def test_create_user_valid(self):
        """Test POST /api/users - Create new user with valid data"""
        try:
            payload = {
                "name": "Maria Silva Santos",
                "email": "maria.santos@ios.org.br",
                "cpf": "987.654.321-00",
                "password": "senha123",
                "role": "monitor",
                "unit_id": "unit1"
            }
            
            response = self.session.post(f"{self.base_url}/users", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and 'message' in data:
                    user = data['user']
                    # Verify password is not in response
                    if 'password' not in user and user['email'] == payload['email']:
                        self.log_test("Create User - Valid", True, "User created successfully", data)
                        return True
                    else:
                        self.log_test("Create User - Valid", False, "Password exposed or incorrect user data")
                        return False
                else:
                    self.log_test("Create User - Valid", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Create User - Valid", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create User - Valid", False, f"Exception: {str(e)}")
            return False

    def test_create_user_validation(self):
        """Test POST /api/users - Test validation with missing fields"""
        try:
            payload = {
                "name": "Test User",
                "email": "test@ios.org.br"
                # Missing required fields: cpf, password, role
            }
            
            response = self.session.post(f"{self.base_url}/users", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data:
                    self.log_test("Create User - Validation", True, "Correctly rejected missing fields", data)
                    return True
                else:
                    self.log_test("Create User - Validation", False, f"Missing error message: {data}")
                    return False
            else:
                self.log_test("Create User - Validation", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Create User - Validation", False, f"Exception: {str(e)}")
            return False

    def test_create_user_duplicate(self):
        """Test POST /api/users - Test duplicate email/CPF validation"""
        try:
            # Try to create user with existing email
            payload = {
                "name": "Duplicate User",
                "email": "joao@ios.org.br",  # Existing email
                "cpf": "999.888.777-66",
                "password": "senha123",
                "role": "monitor"
            }
            
            response = self.session.post(f"{self.base_url}/users", json=payload)
            
            if response.status_code == 409:
                data = response.json()
                if 'error' in data:
                    self.log_test("Create User - Duplicate", True, "Correctly rejected duplicate email", data)
                    return True
                else:
                    self.log_test("Create User - Duplicate", False, f"Missing error message: {data}")
                    return False
            else:
                self.log_test("Create User - Duplicate", False, f"Expected 409, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Create User - Duplicate", False, f"Exception: {str(e)}")
            return False

    def test_get_units(self):
        """Test GET /api/units - Get all units"""
        try:
            response = self.session.get(f"{self.base_url}/units")
            
            if response.status_code == 200:
                data = response.json()
                if 'units' in data and isinstance(data['units'], list):
                    units = data['units']
                    if len(units) > 0:
                        # Verify no _id fields in response
                        has_id_field = any('_id' in unit for unit in units)
                        if not has_id_field:
                            self.log_test("Get Units", True, f"Retrieved {len(units)} units successfully", data)
                            return True
                        else:
                            self.log_test("Get Units", False, "MongoDB _id field found in response")
                            return False
                    else:
                        self.log_test("Get Units", False, "No units found")
                        return False
                else:
                    self.log_test("Get Units", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get Units", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Units", False, f"Exception: {str(e)}")
            return False

    def test_create_unit_valid(self):
        """Test POST /api/units - Create new unit with valid data"""
        try:
            payload = {
                "name": "Unidade Brasília",
                "address": "SQN 123, Bloco A - Asa Norte, Brasília - DF",
                "phone": "(61) 3333-4444"
            }
            
            response = self.session.post(f"{self.base_url}/units", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'unit' in data and 'message' in data:
                    unit = data['unit']
                    if unit['name'] == payload['name'] and 'id' in unit:
                        self.log_test("Create Unit - Valid", True, "Unit created successfully", data)
                        return True
                    else:
                        self.log_test("Create Unit - Valid", False, "Incorrect unit data returned")
                        return False
                else:
                    self.log_test("Create Unit - Valid", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Create Unit - Valid", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Unit - Valid", False, f"Exception: {str(e)}")
            return False

    def test_create_unit_validation(self):
        """Test POST /api/units - Test validation with missing fields"""
        try:
            payload = {
                "name": "Test Unit"
                # Missing required fields: address, phone
            }
            
            response = self.session.post(f"{self.base_url}/units", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data:
                    self.log_test("Create Unit - Validation", True, "Correctly rejected missing fields", data)
                    return True
                else:
                    self.log_test("Create Unit - Validation", False, f"Missing error message: {data}")
                    return False
            else:
                self.log_test("Create Unit - Validation", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Create Unit - Validation", False, f"Exception: {str(e)}")
            return False

    def test_get_courses(self):
        """Test GET /api/courses - Get all courses"""
        try:
            response = self.session.get(f"{self.base_url}/courses")
            
            if response.status_code == 200:
                data = response.json()
                if 'courses' in data and isinstance(data['courses'], list):
                    courses = data['courses']
                    if len(courses) > 0:
                        # Verify no _id fields in response
                        has_id_field = any('_id' in course for course in courses)
                        if not has_id_field:
                            self.log_test("Get Courses", True, f"Retrieved {len(courses)} courses successfully", data)
                            return True
                        else:
                            self.log_test("Get Courses", False, "MongoDB _id field found in response")
                            return False
                    else:
                        self.log_test("Get Courses", False, "No courses found")
                        return False
                else:
                    self.log_test("Get Courses", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get Courses", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Courses", False, f"Exception: {str(e)}")
            return False

    def test_create_course_valid(self):
        """Test POST /api/courses - Create new course with valid data"""
        try:
            payload = {
                "name": "Desenvolvimento Web",
                "description": "Curso completo de desenvolvimento web com HTML, CSS e JavaScript",
                "duration": "200",
                "unit_id": "unit1"
            }
            
            response = self.session.post(f"{self.base_url}/courses", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'course' in data and 'message' in data:
                    course = data['course']
                    if course['name'] == payload['name'] and 'id' in course:
                        self.log_test("Create Course - Valid", True, "Course created successfully", data)
                        return True
                    else:
                        self.log_test("Create Course - Valid", False, "Incorrect course data returned")
                        return False
                else:
                    self.log_test("Create Course - Valid", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Create Course - Valid", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Course - Valid", False, f"Exception: {str(e)}")
            return False

    def test_create_course_validation(self):
        """Test POST /api/courses - Test validation with missing fields"""
        try:
            payload = {
                "name": "Test Course"
                # Missing required fields: duration, unit_id
            }
            
            response = self.session.post(f"{self.base_url}/courses", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data:
                    self.log_test("Create Course - Validation", True, "Correctly rejected missing fields", data)
                    return True
                else:
                    self.log_test("Create Course - Validation", False, f"Missing error message: {data}")
                    return False
            else:
                self.log_test("Create Course - Validation", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Create Course - Validation", False, f"Exception: {str(e)}")
            return False

    def test_backup_export(self):
        """Test GET /api/backup/export - Export complete system backup"""
        try:
            response = self.session.get(f"{self.base_url}/backup/export")
            
            if response.status_code == 200:
                data = response.json()
                if 'backup' in data:
                    backup = data['backup']
                    required_fields = ['timestamp', 'version', 'data']
                    required_collections = ['users', 'units', 'courses', 'classes', 'students', 'attendance', 'presence']
                    
                    if all(field in backup for field in required_fields):
                        if 'data' in backup and all(collection in backup['data'] for collection in required_collections):
                            # Verify no _id fields in backup data
                            has_id_fields = False
                            for collection_name, collection_data in backup['data'].items():
                                if isinstance(collection_data, list):
                                    has_id_fields = any('_id' in item for item in collection_data if isinstance(item, dict))
                                    if has_id_fields:
                                        break
                            
                            if not has_id_fields:
                                self.log_test("Backup Export", True, f"Backup exported successfully with all collections", {"collections": list(backup['data'].keys()), "timestamp": backup['timestamp']})
                                return True
                            else:
                                self.log_test("Backup Export", False, "MongoDB _id fields found in backup data")
                                return False
                        else:
                            missing_collections = [col for col in required_collections if col not in backup.get('data', {})]
                            self.log_test("Backup Export", False, f"Missing collections: {missing_collections}")
                            return False
                    else:
                        missing_fields = [field for field in required_fields if field not in backup]
                        self.log_test("Backup Export", False, f"Missing backup fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Backup Export", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Backup Export", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Backup Export", False, f"Exception: {str(e)}")
            return False

    def test_data_relationships(self):
        """Test data relationships between units, courses, and classes"""
        try:
            # Get units, courses, and classes
            units_response = self.session.get(f"{self.base_url}/units")
            courses_response = self.session.get(f"{self.base_url}/courses")
            classes_response = self.session.get(f"{self.base_url}/classes")
            
            if all(r.status_code == 200 for r in [units_response, courses_response, classes_response]):
                units = units_response.json().get('units', [])
                courses = courses_response.json().get('courses', [])
                classes = classes_response.json().get('classes', [])
                
                # Verify units are linked to courses
                unit_ids = {unit['id'] for unit in units}
                courses_with_units = [course for course in courses if course.get('unit_id') in unit_ids]
                
                # Verify courses are linked to classes
                course_ids = {course['id'] for course in courses}
                classes_with_courses = [cls for cls in classes if cls.get('course_id') in course_ids]
                
                relationships_valid = len(courses_with_units) > 0 and len(classes_with_courses) > 0
                
                if relationships_valid:
                    self.log_test("Data Relationships", True, f"Relationships verified: {len(courses_with_units)} courses linked to units, {len(classes_with_courses)} classes linked to courses", {
                        "units_count": len(units),
                        "courses_with_units": len(courses_with_units),
                        "classes_with_courses": len(classes_with_courses)
                    })
                    return True
                else:
                    self.log_test("Data Relationships", False, "No valid relationships found between units, courses, and classes")
                    return False
            else:
                self.log_test("Data Relationships", False, "Failed to retrieve data for relationship testing")
                return False
                
        except Exception as e:
            self.log_test("Data Relationships", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("BACKEND API TEST SUITE - Sistema de Chamada - IOS")
        print("ADMINISTRATIVE BACKEND TESTING")
        print("=" * 80)
        print(f"Testing API at: {self.base_url}")
        print(f"Test started at: {datetime.now()}")
        print()
        
        # Run all tests - Basic MVP + Administrative Features
        tests = [
            # Basic MVP Tests (already verified)
            self.test_health_check,
            self.test_auth_valid_login,
            self.test_auth_invalid_login,
            self.test_auth_missing_fields,
            self.test_get_classes,
            self.test_get_class_students_valid,
            self.test_get_class_students_invalid,
            self.test_save_attendance_valid,
            self.test_save_attendance_missing_fields,
            self.test_get_attendance_history,
            self.test_get_all_students,
            
            # Administrative Backend Tests
            self.test_auth_admin_roles,
            self.test_dashboard_stats,
            self.test_get_users,
            self.test_create_user_valid,
            self.test_create_user_validation,
            self.test_create_user_duplicate,
            self.test_get_units,
            self.test_create_unit_valid,
            self.test_create_unit_validation,
            self.test_get_courses,
            self.test_create_course_valid,
            self.test_create_course_validation,
            self.test_backup_export,
            self.test_data_relationships
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error - {str(e)}")
                failed += 1
        
        # Summary
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print(f"\nTest completed at: {datetime.now()}")
        print("=" * 80)
        
        return passed, failed

if __name__ == "__main__":
    tester = AttendanceAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)