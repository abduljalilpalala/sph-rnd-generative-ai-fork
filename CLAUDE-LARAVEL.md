---
# LARAVEL CODING STANDARDS
---

## 1. FOLDER STRUCTURE

**Purpose:**

Maintain a consistent, readable, and predictable Laravel project layout for all developers.

**Recommended Structure:**

```
app/
 ├── Console/          # Artisan commands
 ├── Exceptions/       # Custom exception handling
 ├── Http/
 │   ├── Controllers/  # Request handling
 │   ├── Middleware/   # HTTP middleware
 │   ├── Requests/     # Form validation
 ├── Models/           # Eloquent models
 ├── Services/         # Business logic
 ├── Traits/           # Shared traits
 ├── Helpers/          # Reusable global helpers
bootstrap/
config/
database/
 ├── factories/
 ├── migrations/
 ├── seeders/
public/
resources/
 ├── views/            # Blade templates
 ├── lang/             # Localization files
 ├── js/               # Front-end JS
 ├── css/              # Front-end CSS
routes/
 ├── web.php
 ├── api.php
tests/
 ├── Feature/
 ├── Unit/
```

**Best Practices:**

- Keep folder names **singular** (e.g., `Model`, `Service`, `Helper`).
- Group related business logic under `app/Services`.
- Organize by domain for large-scale applications (e.g., `app/Domain/User/...`).

---

## 2. SINGLE RESPONSIBILITY PRINCIPLE (SRP)

**Purpose:**

Each class or method should handle **only one task**. Improves maintainability, readability, and testing.

**Bad Example:**

```php
// ❌ Validation, logging, and DB updates all in one controller
class EventController extends Controller
{
    public function update(Request $request)
    {
        // mixed responsibilities
    }
}
```

**Good Example:**

```php
class EventController extends Controller
{
    public function update(UpdateEventRequest $request)
    {
        $this->eventService->updateEvent($request);
        return back();
    }
}
```

**Guidelines:**

- Controllers handle **requests/responses only**.
- Validation → **Form Requests**
- Business logic → **Service classes**
- Database operations → **Eloquent Models**

---

## 3. FAT MODELS, SKINNY CONTROLLERS

**Purpose:**

Controllers should delegate all database-related logic to models or services.

**Bad Example:**

```php
public function index()
{
    $clients = Client::verified()
        ->with(['orders' => function ($q) {
            $q->where('created_at', '>', Carbon::today()->subWeek());
        }])->get();
    return view('index', ['clients' => $clients]);
}
```

**Good Example:**

```php
public function index()
{
    return view('index', ['clients' => $this->client->getWithNewOrders()]);
}

class Client extends Model {
    public function getWithNewOrders(): Collection {
        return $this->verified()
            ->with(['orders' => fn($q) => $q->where('created_at', '>', Carbon::today()->subWeek())])
            ->get();
    }
}
```

---

## 4. VALIDATION (FORM REQUESTS)

**Purpose:**

Keep validation logic out of controllers for readability and reusability.

**Bad Example:**

```php
public function store(Request $request)
{
    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
        'publish_at' => 'nullable|date',
    ]);
}
```

**Good Example:**

```php
public function store(PostRequest $request)
{
    // clean and reusable validation
}

class PostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
            'publish_at' => 'nullable|date',
        ];
    }
}
```

**Naming:**

- Use descriptive request names:
  `StorePostRequest`, `UpdatePostRequest`

---

## 5. BUSINESS LOGIC IN SERVICE CLASSES

**Purpose:**

Separate business operations from controllers for better **testability** and **reusability**.

**Bad Example:**

```php
public function store(Request $request)
{
    if ($request->hasFile('image')) {
        $request->file('image')->move(public_path('images') . 'temp');
    }
}
```

**Good Example:**

```php
public function store(Request $request)
{
    $this->articleService->handleUploadedImage($request->file('image'));
}

class ArticleService
{
    public function handleUploadedImage($image): void
    {
        if ($image) {
            $image->move(public_path('images') . 'temp');
        }
    }
}
```

---

## 6. DRY (DON’T REPEAT YOURSELF)

**Purpose:**

Avoid duplication — reuse **model scopes**, **helpers**, or **traits**.

**Bad Example:**

```php
public function getActive() {
    return $this->where('verified', 1)->whereNotNull('deleted_at')->get();
}

public function getArticles() {
    return $this->whereHas('user', fn($q) => $q->where('verified', 1)->whereNotNull('deleted_at'))->get();
}
```

**Good Example:**

```php
public function scopeActive($q) {
    return $q->where('verified', true)->whereNotNull('deleted_at');
}

public function getActive(): Collection {
    return $this->active()->get();
}

public function getArticles(): Collection {
    return $this->whereHas('user', fn($q) => $q->active())->get();
}
```

---

## 7. ELOQUENT & QUERY PRACTICES

**Purpose:**

Use **Eloquent ORM** for clean and maintainable database access.

**Bad Example:**

```sql
SELECT * FROM articles
WHERE EXISTS (SELECT * FROM users WHERE articles.user_id = users.id)
AND verified = 1
ORDER BY created_at DESC;
```

**Good Example:**

```php
Article::has('user.profile')->verified()->latest()->get();
```

---

## 8. BLADE & DATA HANDLING

**Purpose:**

Avoid running heavy queries inside Blade templates.

**Bad Example:**

```blade
@foreach (User::all() as $user)
  {{ $user->profile->name }}
@endforeach
```

**Good Example:**

```php
$users = User::with('profile')->get();
```

```blade
@foreach ($users as $user)
  {{ $user->profile->name }}
@endforeach
```

**Naming:**

- Blade files: `kebab-case` → `show-user.blade.php`

---

## 9. NAMING CONVENTIONS

**Convention Table:**

| Type        | Convention   | Example                  |
| ----------- | ------------ | ------------------------ |
| Controller  | Singular     | `ArticleController`      |
| Model       | Singular     | `User`                   |
| Route       | Plural       | `/users/{id}`            |
| Table       | Plural       | `articles`, `user_roles` |
| Pivot       | Alphabetical | `article_user`           |
| Variable    | camelCase    | `$activeUser`            |
| Method      | camelCase    | `getActiveUsers()`       |
| View        | kebab-case   | `show-profile.blade.php` |
| Config File | snake_case   | `google_calendar.php`    |

---

## 10. CONFIGURATION & ENVIRONMENT

**Purpose:**

Keep environment data secure and non-hardcoded.

**Bad Example:**

```php
$apiKey = env('PAYMENT_API_KEY');
$client = new PaymentClient($apiKey);
```

**Good Example:**

```php
// config/payment.php
return [
    'api_key' => env('PAYMENT_API_KEY'),
];

// usage
$client = new PaymentClient(config('payment.api_key'));
```

**Best Practices:**

- Use `.env` for secrets.
- Use `config()` helpers, not direct `env()`.
- Cache configs in production:
  `php artisan config:cache`

---

## 11. SHORT SYNTAX & HELPERS

**Purpose:**

Use Laravel’s helpers for **cleaner syntax** and **expressive code**.

**Examples:**

| Bad                                                             | Good                                     |
| --------------------------------------------------------------- | ---------------------------------------- |
| `return redirect()->route('users.index', ['id' => $user->id]);` | `return to_route('users.index', $user);` |
| `<?php echo $user->name; ?>`                                    | `{{ $user->name }}`                      |

**Recommended Shortcuts:**

- `optional($user)->email`
- `collect($items)->pluck('id')`
- Blade directives: `@foreach`, `@if`, `@error`, `@csrf`

---

## 12. TESTING GUIDELINES

**Purpose:**

Encourage a clear, test-driven structure.

**Good Example:**

```php
public function test_user_can_access_dashboard()
{
    $user = User::factory()->create();

    $this->actingAs($user)
         ->get('/dashboard')
         ->assertStatus(200)
         ->assertSee('Welcome');
}
```

**Structure:**

```
tests/
 ├── Feature/  # HTTP flow tests
 ├── Unit/     # Logic-level tests
 ├── Factories/ # Test data
```

**Best Practices:**

- Use **factories** for setup.
- Run parallel tests: `php artisan test --parallel`.
- Always test before push.

---

## 13. ERROR HANDLING & LOGGING

**Purpose:**

Handle all exceptions gracefully and securely.

**Bad Example:**

```php
try {
    $user = User::findOrFail($id);
} catch (\Exception $e) {
    dd($e->getMessage());
}
```

**Good Example:**

```php
try {
    $user = User::findOrFail($id);
} catch (ModelNotFoundException $e) {
    Log::warning('User not found', ['id' => $id]);
    abort(404, 'User not found');
}
```

**Best Practices:**

- Never expose raw exception messages.
- Use structured logging:
  `Log::error('...', ['user_id' => $id])`
- Store logs in `storage/logs`.

---

## 14. API RESOURCE & RESPONSE STANDARDIZATION

**Purpose:**

Maintain consistent API response formats.

**Bad Example:**

```php
return User::all();
```

**Good Example:**

```php
return response()->json([
    'status' => 'success',
    'message' => 'Users fetched successfully',
    'data' => UserResource::collection(User::all())
]);
```

**Structure:**

```
app/Http/Resources/
app/Http/Controllers/Api/
```

**Best Practices:**

- Use `Resource::collection()` for lists.
- Define unified error formats:

```json
{
  "status": "error",
  "message": "Resource not found"
}
```

---

## 15. PERFORMANCE & QUERY OPTIMIZATION

**Purpose:**

Enhance scalability and minimize query overhead.

**Bad Example:**

```php
$users = User::all();
foreach ($users as $user) {
    echo $user->profile->bio;
}
```

**Good Example:**

```php
$users = User::with('profile')->paginate(20);
```

**Best Practices:**

- Use eager loading (`with()`).
- Use caching:
  `Cache::remember('key', 60, fn() => Model::all());`
- Profile queries with Telescope or Debugbar.

---

## 16. SECURITY & AUTHORIZATION STANDARDS

**Purpose:**

Protect the app from unauthorized access and data leaks.

**Bad Example:**

```php
if ($request->user()->role === 'admin') {
    // manual check
}
```

**Good Example:**

```php
$this->authorize('update', $user);
```

**Best Practices:**

- Use **Policies & Gates**.
- Always validate input.
- Use **CSRF protection**.
- Hash passwords with `Hash::make()`.
- Hide sensitive attributes in models.

---

## ✅ SUMMARY CHECKLIST

- Follow consistent **folder structure**.
- Apply **SRP** and keep controllers clean.
- Use **Form Requests** for validation.
- Move business logic to **Service classes**.
- Apply **DRY**, reuse helpers and scopes.
- Handle errors using centralized **logging**.
- Use **Resources** for API responses.
- Optimize **queries** and **cache** efficiently.
- Ensure strong **security** and **authorization**.
