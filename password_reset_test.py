#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://ios-attendance.preview.emergentagent.com/api"

def log_test(test_name, status, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌"
    print(f"[{timestamp}] {status_symbol} {test_name}")
    if details:
        print(f"    Details: {details}")
    print()

def test_password_reset_system():
    """Test the complete password reset system functionality"""
    print("=" * 80)
    print("TESTING: Password Reset System (FIXED VERSION)")
    print("=" * 80)
    
    # Test data - using realistic data for the IOS system
    test_email = "jverissimo87.jvj@gmail.com"  # Known approved user from database
    invalid_email = "nonexistent@ios.org.br"
    
    try:
        # Test 1: Password reset with valid approved user email
        print("Test 1: Password reset with valid approved user email")
        reset_data = {"email": test_email}
        
        response = requests.post(f"{BASE_URL}/auth/reset", 
                               json=reset_data,
                               headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            reset_result = response.json()
            if "tempPassword" in reset_result and "message" in reset_result:
                temp_password = reset_result["tempPassword"]
                log_test("Password Reset - Valid User", "PASS", 
                        f"Temporary password generated: {temp_password}")
                
                # Test 2: Login with the temporary password
                print("Test 2: Login with temporary password")
                login_data = {"email": test_email, "password": temp_password}
                
                login_response = requests.post(f"{BASE_URL}/auth/login",
                                             json=login_data,
                                             headers={"Content-Type": "application/json"})
                
                if login_response.status_code == 200:
                    login_result = login_response.json()
                    if "user" in login_result and login_result["user"]["status"] == "approved":
                        log_test("Login with Temporary Password", "PASS",
                                f"Successfully logged in as {login_result['user']['name']}, status: {login_result['user']['status']}")
                        
                        # Verify user status remains approved
                        if login_result["user"]["status"] == "approved":
                            log_test("User Status After Reset", "PASS",
                                    "User status remains 'approved' after password reset")
                        else:
                            log_test("User Status After Reset", "FAIL",
                                    f"Expected 'approved', got '{login_result['user']['status']}'")
                    else:
                        log_test("Login with Temporary Password", "FAIL",
                                f"Login response missing user data or incorrect status: {login_result}")
                else:
                    log_test("Login with Temporary Password", "FAIL",
                            f"Login failed with status {login_response.status_code}: {login_response.text}")
            else:
                log_test("Password Reset - Valid User", "FAIL",
                        f"Missing tempPassword or message in response: {reset_result}")
        else:
            log_test("Password Reset - Valid User", "FAIL",
                    f"Reset failed with status {response.status_code}: {response.text}")
        
        # Test 3: Password reset with non-existent email
        print("Test 3: Password reset with non-existent email")
        invalid_reset_data = {"email": invalid_email}
        
        invalid_response = requests.post(f"{BASE_URL}/auth/reset",
                                       json=invalid_reset_data,
                                       headers={"Content-Type": "application/json"})
        
        if invalid_response.status_code == 404:
            log_test("Password Reset - Invalid Email", "PASS",
                    "Correctly returned 404 for non-existent email")
        else:
            log_test("Password Reset - Invalid Email", "FAIL",
                    f"Expected 404, got {invalid_response.status_code}: {invalid_response.text}")
        
        # Test 4: Password reset with missing email
        print("Test 4: Password reset with missing email")
        empty_data = {}
        
        empty_response = requests.post(f"{BASE_URL}/auth/reset",
                                     json=empty_data,
                                     headers={"Content-Type": "application/json"})
        
        if empty_response.status_code == 400:
            log_test("Password Reset - Missing Email", "PASS",
                    "Correctly returned 400 for missing email")
        else:
            log_test("Password Reset - Missing Email", "FAIL",
                    f"Expected 400, got {empty_response.status_code}: {empty_response.text}")
        
    except requests.exceptions.RequestException as e:
        log_test("Password Reset System", "FAIL", f"Network error: {str(e)}")
        return False
    except Exception as e:
        log_test("Password Reset System", "FAIL", f"Unexpected error: {str(e)}")
        return False

def test_complete_password_reset_flow():
    """Test the complete password reset flow: register → approve → reset → login"""
    print("=" * 80)
    print("TESTING: Complete Password Reset Flow")
    print("=" * 80)
    
    try:
        # Test data for new user - using unique email with timestamp
        import time
        timestamp = str(int(time.time()))
        new_user_email = f"testuser_{timestamp}@ios.org.br"
        new_user_data = {
            "name": f"Test User {timestamp}",
            "email": new_user_email,
            "cpf": f"987.654.{timestamp[-3:]}-00",
            "password": "initialpass123",
            "role": "instrutor",
            "unit_id": "unit1"
        }
        
        # Step 1: Register new user
        print("Step 1: Register new user")
        register_response = requests.post(f"{BASE_URL}/auth/register",
                                        json=new_user_data,
                                        headers={"Content-Type": "application/json"})
        
        if register_response.status_code == 200:
            register_result = register_response.json()
            user_id = register_result["user"]["id"]
            log_test("User Registration", "PASS", f"User registered with ID: {user_id}")
            
            # Step 2: Approve user
            print("Step 2: Approve user")
            approve_response = requests.post(f"{BASE_URL}/users/approve/{user_id}",
                                           headers={"Content-Type": "application/json"})
            
            if approve_response.status_code == 200:
                log_test("User Approval", "PASS", "User approved successfully")
                
                # Step 3: Reset password
                print("Step 3: Reset password")
                reset_data = {"email": new_user_email}
                reset_response = requests.post(f"{BASE_URL}/auth/reset",
                                             json=reset_data,
                                             headers={"Content-Type": "application/json"})
                
                if reset_response.status_code == 200:
                    reset_result = reset_response.json()
                    temp_password = reset_result["tempPassword"]
                    log_test("Password Reset for New User", "PASS",
                            f"Temporary password generated: {temp_password}")
                    
                    # Step 4: Login with temporary password
                    print("Step 4: Login with temporary password")
                    login_data = {"email": new_user_email, "password": temp_password}
                    login_response = requests.post(f"{BASE_URL}/auth/login",
                                                 json=login_data,
                                                 headers={"Content-Type": "application/json"})
                    
                    if login_response.status_code == 200:
                        login_result = login_response.json()
                        if login_result["user"]["status"] == "approved":
                            log_test("Complete Flow - Final Login", "PASS",
                                    f"Successfully completed full flow for {login_result['user']['name']}")
                        else:
                            log_test("Complete Flow - Final Login", "FAIL",
                                    f"User status incorrect: {login_result['user']['status']}")
                    else:
                        log_test("Complete Flow - Final Login", "FAIL",
                                f"Login failed: {login_response.status_code} - {login_response.text}")
                else:
                    log_test("Password Reset for New User", "FAIL",
                            f"Reset failed: {reset_response.status_code} - {reset_response.text}")
            else:
                log_test("User Approval", "FAIL",
                        f"Approval failed: {approve_response.status_code} - {approve_response.text}")
        else:
            log_test("User Registration", "FAIL",
                    f"Registration failed: {register_response.status_code} - {register_response.text}")
            
    except requests.exceptions.RequestException as e:
        log_test("Complete Password Reset Flow", "FAIL", f"Network error: {str(e)}")
        return False
    except Exception as e:
        log_test("Complete Password Reset Flow", "FAIL", f"Unexpected error: {str(e)}")
        return False

def main():
    """Main test execution"""
    print("Sistema de Chamada - IOS: Password Reset System Testing")
    print("Testing Backend API at:", BASE_URL)
    print("=" * 80)
    
    # Test the fixed password reset system
    test_password_reset_system()
    
    # Test the complete flow
    test_complete_password_reset_flow()
    
    print("=" * 80)
    print("PASSWORD RESET TESTING COMPLETED")
    print("=" * 80)

if __name__ == "__main__":
    main()