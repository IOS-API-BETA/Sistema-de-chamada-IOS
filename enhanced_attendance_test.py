#!/usr/bin/env python3
"""
Enhanced Attendance System Test Suite for Sistema de Chamada - IOS
Tests the enhanced attendance features as requested in the review
"""

import requests
import json
import sys
import uuid
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://ios-attendance.preview.emergentagent.com/api"

class EnhancedAttendanceAPITester:
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

    def test_enhanced_attendance_system(self):
        """Test POST /api/attendance - Enhanced attendance with new format (present/justified/observation/certificate)"""
        try:
            # Test enhanced attendance data structure
            payload = {
                "classId": "class1",
                "date": "2025-01-15",
                "startTime": "08:00",
                "endTime": "12:00",
                "instructor": "Professor João Silva",
                "classObservations": "Aula sobre programação básica. Todos os alunos participaram ativamente.",
                "attendanceData": {
                    "student1": {
                        "present": True,
                        "justified": False,
                        "observation": "Participou ativamente da aula",
                        "certificate": None
                    },
                    "student2": {
                        "present": False,
                        "justified": True,
                        "observation": "Falta justificada por atestado médico",
                        "certificate": {
                            "url": "https://example.com/certificate.pdf",
                            "name": "atestado_medico.pdf"
                        }
                    },
                    "student3": {
                        "present": False,
                        "justified": False,
                        "observation": "Falta não justificada",
                        "certificate": None
                    },
                    "student4": {
                        "present": True,
                        "justified": False,
                        "observation": "Chegou 15 minutos atrasado",
                        "certificate": None
                    }
                }
            }
            
            response = self.session.post(f"{self.base_url}/attendance", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'attendanceId' in data and 'recordsCount' in data:
                    # Verify the response includes the expected fields
                    if data['recordsCount'] == 4:  # Should match number of students in attendanceData
                        self.log_test("Enhanced Attendance System", True, 
                                    f"Enhanced attendance saved successfully with {data['recordsCount']} student records", data)
                        return True, data['attendanceId']
                    else:
                        self.log_test("Enhanced Attendance System", False, 
                                    f"Expected 4 student records, got {data['recordsCount']}")
                        return False, None
                else:
                    self.log_test("Enhanced Attendance System", False, f"Invalid response structure: {data}")
                    return False, None
            else:
                self.log_test("Enhanced Attendance System", False, 
                            f"Status code: {response.status_code}, Response: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_test("Enhanced Attendance System", False, f"Exception: {str(e)}")
            return False, None

    def test_class_creation_semester_support(self):
        """Test POST /api/classes - Class creation with semester support (cycle in semester format)"""
        try:
            # Test creating class with semester format cycle
            payload = {
                "name": "Programação Avançada - Turma C",
                "unit_id": "unit1",
                "course_id": "course1",
                "instructor_id": "joao@ios.org.br",
                "cycle": "1º/2025"  # Semester format as requested
            }
            
            response = self.session.post(f"{self.base_url}/classes", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'class' in data and 'message' in data:
                    created_class = data['class']
                    # Verify cycle field stores semester information correctly
                    if created_class.get('cycle') == "1º/2025":
                        self.log_test("Class Creation Semester Support", True, 
                                    f"Class created successfully with semester cycle: {created_class['cycle']}", data)
                        return True, created_class['id']
                    else:
                        self.log_test("Class Creation Semester Support", False, 
                                    f"Cycle field incorrect: expected '1º/2025', got '{created_class.get('cycle')}'")
                        return False, None
                else:
                    self.log_test("Class Creation Semester Support", False, f"Invalid response structure: {data}")
                    return False, None
            else:
                self.log_test("Class Creation Semester Support", False, 
                            f"Status code: {response.status_code}, Response: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_test("Class Creation Semester Support", False, f"Exception: {str(e)}")
            return False, None

    def test_reports_generation_system(self):
        """Test POST /api/reports/generate - Report generation functionality"""
        try:
            response = self.session.post(f"{self.base_url}/reports/generate", json={})
            
            if response.status_code == 200:
                # Check if response is CSV format
                content_type = response.headers.get('Content-Type', '')
                content_disposition = response.headers.get('Content-Disposition', '')
                
                if 'text/csv' in content_type and 'attachment' in content_disposition:
                    csv_content = response.text
                    
                    # Verify CSV has proper headers
                    lines = csv_content.strip().split('\n')
                    if len(lines) > 0:
                        header = lines[0]
                        expected_fields = ['Data', 'Turma', 'Curso', 'Unidade', 'Aluno', 'CPF', 'Status', 'Observacao', 'Instrutor']
                        
                        # Check if all expected fields are in header
                        header_fields_present = all(field in header for field in expected_fields)
                        
                        if header_fields_present:
                            self.log_test("Reports Generation System", True, 
                                        f"CSV report generated successfully with proper headers. Total lines: {len(lines)}", 
                                        {"headers": header, "total_lines": len(lines)})
                            return True
                        else:
                            missing_fields = [field for field in expected_fields if field not in header]
                            self.log_test("Reports Generation System", False, 
                                        f"Missing required fields in CSV header: {missing_fields}")
                            return False
                    else:
                        self.log_test("Reports Generation System", False, "Empty CSV content")
                        return False
                else:
                    self.log_test("Reports Generation System", False, 
                                f"Expected CSV format, got Content-Type: {content_type}")
                    return False
            else:
                self.log_test("Reports Generation System", False, 
                            f"Status code: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Reports Generation System", False, f"Exception: {str(e)}")
            return False

    def test_student_management_validation(self):
        """Test POST /api/students - CPF duplicate validation"""
        try:
            # First, create a student
            payload1 = {
                "name": "Carlos Eduardo Silva",
                "cpf": "111.222.333-44",
                "class_id": "class1"
            }
            
            response1 = self.session.post(f"{self.base_url}/students", json=payload1)
            
            if response1.status_code == 200:
                # Now try to create another student with the same CPF
                payload2 = {
                    "name": "Maria Fernanda Santos",
                    "cpf": "111.222.333-44",  # Same CPF
                    "class_id": "class2"
                }
                
                response2 = self.session.post(f"{self.base_url}/students", json=payload2)
                
                if response2.status_code == 409:
                    data = response2.json()
                    if 'error' in data and 'CPF' in data['error']:
                        self.log_test("Student Management Validation", True, 
                                    "CPF duplicate validation working correctly", data)
                        return True
                    else:
                        self.log_test("Student Management Validation", False, 
                                    f"Expected CPF error message, got: {data}")
                        return False
                else:
                    self.log_test("Student Management Validation", False, 
                                f"Expected 409 for duplicate CPF, got {response2.status_code}")
                    return False
            else:
                self.log_test("Student Management Validation", False, 
                            f"Failed to create first student: {response1.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Student Management Validation", False, f"Exception: {str(e)}")
            return False

    def test_complete_attendance_flow(self):
        """Test complete attendance flow: create class → add students → take attendance → generate report"""
        try:
            # Step 1: Create a new class with semester format
            class_payload = {
                "name": "Teste Completo - Turma D",
                "unit_id": "unit1",
                "course_id": "course1",
                "instructor_id": "joao@ios.org.br",
                "cycle": "2º/2025"
            }
            
            class_response = self.session.post(f"{self.base_url}/classes", json=class_payload)
            
            if class_response.status_code != 200:
                self.log_test("Complete Attendance Flow", False, 
                            f"Failed to create class: {class_response.status_code}")
                return False
            
            class_data = class_response.json()
            class_id = class_data['class']['id']
            
            # Step 2: Add students to the class
            students_data = []
            for i in range(3):
                student_payload = {
                    "name": f"Aluno Teste {i+1}",
                    "cpf": f"555.666.777-{i:02d}",
                    "class_id": class_id
                }
                
                student_response = self.session.post(f"{self.base_url}/students", json=student_payload)
                
                if student_response.status_code != 200:
                    self.log_test("Complete Attendance Flow", False, 
                                f"Failed to create student {i+1}: {student_response.status_code}")
                    return False
                
                student_data = student_response.json()
                students_data.append(student_data['student'])
            
            # Step 3: Take attendance with enhanced data
            attendance_payload = {
                "classId": class_id,
                "date": "2025-01-16",
                "startTime": "14:00",
                "endTime": "18:00",
                "instructor": "Professor João Silva",
                "classObservations": "Aula prática de programação. Exercícios em dupla.",
                "attendanceData": {
                    students_data[0]['id']: {
                        "present": True,
                        "justified": False,
                        "observation": "Excelente participação",
                        "certificate": None
                    },
                    students_data[1]['id']: {
                        "present": False,
                        "justified": True,
                        "observation": "Justificativa por compromisso familiar",
                        "certificate": {
                            "url": "https://example.com/justificativa.pdf",
                            "name": "justificativa_familiar.pdf"
                        }
                    },
                    students_data[2]['id']: {
                        "present": True,
                        "justified": False,
                        "observation": "Chegou no horário",
                        "certificate": None
                    }
                }
            }
            
            attendance_response = self.session.post(f"{self.base_url}/attendance", json=attendance_payload)
            
            if attendance_response.status_code != 200:
                self.log_test("Complete Attendance Flow", False, 
                            f"Failed to save attendance: {attendance_response.status_code}")
                return False
            
            # Step 4: Generate report to verify data relationships
            report_response = self.session.post(f"{self.base_url}/reports/generate", json={})
            
            if report_response.status_code != 200:
                self.log_test("Complete Attendance Flow", False, 
                            f"Failed to generate report: {report_response.status_code}")
                return False
            
            # Verify report contains our test data
            csv_content = report_response.text
            
            # Check if our test class and students appear in the report
            class_name_in_report = class_payload['name'] in csv_content
            student_names_in_report = any(student['name'] in csv_content for student in students_data)
            
            if class_name_in_report and student_names_in_report:
                self.log_test("Complete Attendance Flow", True, 
                            "Complete flow successful: class created → students added → attendance taken → report generated", 
                            {
                                "class_id": class_id,
                                "students_count": len(students_data),
                                "attendance_saved": True,
                                "report_generated": True
                            })
                return True
            else:
                self.log_test("Complete Attendance Flow", False, 
                            "Data not found in generated report")
                return False
                
        except Exception as e:
            self.log_test("Complete Attendance Flow", False, f"Exception: {str(e)}")
            return False

    def test_enhanced_data_structure_verification(self):
        """Verify enhanced data structure with startTime, endTime, classObservations, instructor"""
        try:
            # Get attendance history to verify enhanced data structure
            response = self.session.get(f"{self.base_url}/attendance")
            
            if response.status_code == 200:
                data = response.json()
                if 'attendance' in data and isinstance(data['attendance'], list):
                    attendance_records = data['attendance']
                    
                    if len(attendance_records) > 0:
                        # Check if recent records have enhanced fields
                        enhanced_records = []
                        for record in attendance_records:
                            has_enhanced_fields = all(field in record for field in 
                                                    ['start_time', 'end_time', 'class_observations', 'instructor'])
                            if has_enhanced_fields:
                                enhanced_records.append(record)
                        
                        if len(enhanced_records) > 0:
                            self.log_test("Enhanced Data Structure Verification", True, 
                                        f"Found {len(enhanced_records)} attendance records with enhanced data structure", 
                                        {"enhanced_records_count": len(enhanced_records)})
                            return True
                        else:
                            self.log_test("Enhanced Data Structure Verification", False, 
                                        "No attendance records found with enhanced data structure")
                            return False
                    else:
                        self.log_test("Enhanced Data Structure Verification", False, 
                                    "No attendance records found to verify")
                        return False
                else:
                    self.log_test("Enhanced Data Structure Verification", False, 
                                f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Enhanced Data Structure Verification", False, 
                            f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Enhanced Data Structure Verification", False, f"Exception: {str(e)}")
            return False

    def run_enhanced_tests(self):
        """Run all enhanced attendance system tests"""
        print("=" * 80)
        print("ENHANCED ATTENDANCE SYSTEM TEST SUITE - Sistema de Chamada - IOS")
        print("Testing Enhanced Features as per Review Request")
        print("=" * 80)
        print(f"Testing API at: {self.base_url}")
        print(f"Test started at: {datetime.now()}")
        print()
        
        # Run enhanced feature tests
        tests = [
            self.test_enhanced_attendance_system,
            self.test_class_creation_semester_support,
            self.test_reports_generation_system,
            self.test_student_management_validation,
            self.test_complete_attendance_flow,
            self.test_enhanced_data_structure_verification
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
        print("ENHANCED FEATURES TEST SUMMARY")
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
    tester = EnhancedAttendanceAPITester()
    passed, failed = tester.run_enhanced_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)