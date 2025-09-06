### Users
- Authenticated User
    - Can view its own profile
    - Can view any other user profile
    - Can try to view non-existing user profile
- Non-Authenticated User
    - Can view any user profile
    - Can try to view non-existing user profile

### Relationships
- isAuthenticated
    - true: Authenticated User
        - currentUser
            - valid: User exist
                - curretUserId = authenticatedUserId
                    - trying to view own profile
                - curretUserId != authenticatedUserId
                    - trying to view other profile
            - null: User not exist
                - trying to view wrong profile
    - false: Non-Authenticated User 
        - currentUser
            - valid: User exist
                - curretUserId = authenticatedUserId
                    - trying to view own profile
                - curretUserId != authenticatedUserId
                    - trying to view other profile
            - null: User not exist
                - trying to view wrong profile

### Flags Needed
- isAuthenticated: true, false
- isMe: true, false
- isValidUser: true, false

### Flag Combinations Table

| isAuthenticated | isMe | isValidUser | User State | Profile Being Viewed | Permissions | Description |
|----------------|------|-------------|------------|---------------------|-------------|-------------|
| `true` | `true` | `true` | Authenticated User | Own Profile | Full Access | User is logged in and viewing their own valid profile |
| `true` | `false` | `true` | Authenticated User | Other User's Profile | View Access | User is logged in and viewing another valid user's profile |
| `true` | `false` | `false` | Authenticated User | Non-existent Profile | Error Access | User is logged in but trying to view a profile that doesn't exist |
| `true` | `true` | `false` | Authenticated User | Own Non-existent Profile | Error Access | User is logged in but their own profile doesn't exist (edge case) |
| `false` | `false` | `true` | Non-Authenticated User | Any Valid Profile | Read-Only Access | Guest user viewing a valid profile (cannot be "me" since not authenticated) |
| `false` | `false` | `false` | Non-Authenticated User | Non-existent Profile | Error Access | Guest user trying to view a profile that doesn't exist |
| `false` | `true` | `true` | Non-Authenticated User | Valid Profile | Read-Only Access | Guest user viewing a profile (impossible to be "me" when not authenticated) |
| `false` | `true` | `false` | Non-Authenticated User | Non-existent Profile | Error Access | Guest user viewing non-existent profile (impossible to be "me" when not authenticated) |

### Flag Logic Rules

#### isAuthenticated
- `true`: User has valid authentication token/session
- `false`: User is a guest/visitor

#### isMe
- `true`: Current user ID matches authenticated user ID (only possible when `isAuthenticated = true`)
- `false`: Viewing someone else's profile or not authenticated

#### isValidUser
- `true`: The profile being viewed belongs to a real, existing user
- `false`: The profile being viewed doesn't exist (404 scenario)

### Implementation Notes

```typescript
// Example flag calculation
const isAuthenticated = !!localStorage.getItem('access_token');
const isValidUser = !!currentUser; // currentUser exists and is not null
const isMe = isAuthenticated && currentUserId === authenticatedUserId;

// UI rendering based on flags
if (!isValidUser) {
    return <UserNotFoundPage />;
}

if (isMe) {
    return <EditPortfolio />;
} else {
    return <ReadOnlyPortfolio />;
}
```