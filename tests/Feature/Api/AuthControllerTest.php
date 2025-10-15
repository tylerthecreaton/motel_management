<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can register successfully
     */
    public function test_user_can_register_successfully(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'created_at',
                    'updated_at',
                ],
                'token',
            ])
            ->assertJson([
                'message' => 'User registered successfully',
            ]);

        // Verify user was created in database
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);

        // Verify password is not in response
        $response->assertJsonMissing(['password']);
    }

    /**
     * Test registration fails with invalid data
     */
    public function test_registration_fails_with_invalid_data(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    /**
     * Test registration fails with duplicate email
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        // Create existing user
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test user can login with valid credentials
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        // Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
                'token',
            ])
            ->assertJson([
                'message' => 'Login successful',
            ]);

        // Verify password is not in response
        $response->assertJsonMissing(['password']);
    }

    /**
     * Test login fails with invalid credentials
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        // Create a user
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'The provided credentials are incorrect.',
            ]);
    }

    /**
     * Test login fails with non-existent user
     */
    public function test_login_fails_with_non_existent_user(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'The provided credentials are incorrect.',
            ]);
    }

    /**
     * Test authenticated user can get their information
     */
    public function test_authenticated_user_can_get_their_information(): void
    {
        // Create a user and token
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->getJson('/api/me', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
            ])
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ],
            ]);

        // Verify password is not in response
        $response->assertJsonMissing(['password']);
    }

    /**
     * Test unauthenticated user cannot access me endpoint
     */
    public function test_unauthenticated_user_cannot_access_me_endpoint(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can logout
     */
    public function test_authenticated_user_can_logout(): void
    {
        // Create a user and token
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/logout', [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out successfully',
            ]);

        // Verify token was deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    /**
     * Test unauthenticated user cannot logout
     */
    public function test_unauthenticated_user_cannot_logout(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    /**
     * Test user can logout from all devices
     */
    public function test_user_can_logout_from_all_devices(): void
    {
        // Create a user with multiple tokens
        $user = User::factory()->create();
        $token1 = $user->createToken('token-1')->plainTextToken;
        $token2 = $user->createToken('token-2')->plainTextToken;
        $token3 = $user->createToken('token-3')->plainTextToken;

        // Logout from all devices using one token
        $response = $this->postJson('/api/logout-all', [], [
            'Authorization' => 'Bearer ' . $token1,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out from all devices successfully',
            ]);

        // Verify all tokens were deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    /**
     * Test token is revoked after logout
     */
    public function test_token_is_revoked_after_logout(): void
    {
        // Create a user and token
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        // Logout
        $this->postJson('/api/logout', [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        // Try to access protected route with revoked token
        $response = $this->getJson('/api/me', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test password is hashed in database
     */
    public function test_password_is_hashed_in_database(): void
    {
        $password = 'password123';

        $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $user = User::where('email', 'test@example.com')->first();

        // Verify password is hashed (not plain text)
        $this->assertNotEquals($password, $user->password);
        
        // Verify password can be verified with Hash::check
        $this->assertTrue(Hash::check($password, $user->password));
    }
}
