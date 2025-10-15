<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Create new user with hashed password
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Create Sanctum API token for the user
        $token = $user->createToken('auth-token')->plainTextToken;

        // Remove password from user object before returning
        $user->makeHidden(['password']);

        // Return 201 Created response with user and token
        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and create token
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validate incoming request for email and password
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct using Hash::check
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Return 401 Unauthorized with clear error message
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        // Create Sanctum token for the user
        $token = $user->createToken('auth-token')->plainTextToken;

        // Remove password from user object before returning
        $user->makeHidden(['password']);

        // Return success response with user object and plain text token
        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    /**
     * Logout user (revoke current token)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Revoke the current user's token
        $request->user()->currentAccessToken()->delete();

        // Return 200 OK response with success message
        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }

    /**
     * Logout from all devices (revoke all tokens)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logoutAll(Request $request)
    {
        // Revoke all tokens for the user
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out from all devices successfully',
        ]);
    }

    /**
     * Get the current authenticated user's information
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        // Get authenticated user
        $user = $request->user();

        // Ensure password is never returned in response
        $user->makeHidden(['password']);

        // Return current authenticated user's object as JSON
        return response()->json([
            'user' => $user,
        ], 200);
    }
}
