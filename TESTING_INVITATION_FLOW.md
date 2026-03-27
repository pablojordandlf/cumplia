# 🧪 Testing Guide: Invitation Flow (Complete)

## ✅ What Was Fixed

The invitation system now works end-to-end:
1. User clicks email link with invitation token
2. User signs up with email + password
3. User is automatically added to organization
4. User can immediately login and access dashboard
5. Database records are updated correctly

## 🧪 Test Cases

### Test 1: Accept Invitation → Sign Up (Unauthenticated User)
**Preconditions:**
- You're NOT logged in
- You have an invitation email with link like:
  ```
  https://cumplia.vercel.app/accept-invite?token=XXX&email=your@email.com
  ```

**Steps:**
1. Click the invitation link in the email
2. You should see the accept-invite page with organization details
3. It should detect you're not logged in and show a signup button or redirect
4. You're redirected to `/register?invitation_token=XXX&email=your@email.com`
5. Email field is pre-filled and DISABLED
6. Enter password (min 8 chars)
7. Click "Crear Cuenta"
8. Should show "¡Registro Exitoso!" message
9. Automatically redirected to `/dashboard` within 1-2 seconds
10. Dashboard should load (you should see your organization)

**Expected Result:** ✅ Dashboard loads, you're authenticated, can access organization

---

### Test 2: Verify Database Changes
**Preconditions:** Test 1 completed

**In Supabase, check:**

1. **Auth Users** → Find your email
   - Status should be `CONFIRMED` (not waiting for confirmation)
   - Should have a valid user_id

2. **pending_invitations table:**
   ```sql
   SELECT * FROM pending_invitations 
   WHERE email = 'your@email.com' 
   LIMIT 1;
   ```
   - `status` should be `'accepted'` (was `'pending'`)
   - `updated_at` should be recent timestamp

3. **organization_members table:**
   ```sql
   SELECT * FROM organization_members 
   WHERE organization_id = 'YOUR_ORG_ID' 
   AND user_id = 'YOUR_NEW_USER_ID';
   ```
   - Should have ONE row
   - `status` = `'active'`
   - `role` = whatever was in invitation (e.g., 'member', 'admin')
   - `created_at` = recent

---

### Test 3: Login After Signup
**Preconditions:** Test 1 completed, dashboard still open

**Steps:**
1. Click your avatar/profile menu in top-right
2. Click "Logout"
3. You're redirected to login page
4. Enter your email and password from signup
5. Click "Iniciar Sesión"
6. Should be redirected to dashboard
7. Dashboard loads successfully

**Expected Result:** ✅ Can login with credentials from signup, dashboard works

---

### Test 4: Error Cases

#### 4a. Wrong Email in Invitation Link
**Steps:**
1. Try to sign up with email that DOESN'T match the invitation email
2. Should see error: "El email no coincide con la invitación"

**Expected Result:** ✅ Error shown, registration blocked

---

#### 4b. Expired Invitation
**Setup in Supabase:**
```sql
UPDATE pending_invitations 
SET invite_expires_at = NOW() - INTERVAL '1 day'
WHERE email = 'test@email.com';
```

**Steps:**
1. Try to accept this expired invitation
2. Should see error: "Esta invitación ha expirado"

**Expected Result:** ✅ Error shown, registration blocked

---

#### 4c. Email Already Exists
**Preconditions:**
- You have an existing user registered with email X
- You have an invitation for email X

**Steps:**
1. Try to sign up with the invitation for email X
2. Should see error: "Este email ya está registrado"

**Expected Result:** ✅ Error shown, status 422 handled correctly

---

#### 4d. Already Accepted Invitation
**Setup:**
- Complete Test 1 successfully (invitation accepted)
- Wait 30 seconds
- Create NEW invitation for same email

**Steps:**
1. Try to accept the FIRST (now accepted) invitation again
2. Should see error: "Esta invitación ya ha sido aceptada"

**Expected Result:** ✅ Error shown, can't accept same invite twice

---

### Test 5: Browser Console Logs
**During Test 1, open DevTools (F12) and check Console:**

You should see logs like:
```
🟡 [REGISTER_WITH_INVITATION] Request received {email: '...', tokenPrefix: '...'}
🟡 [REGISTER_WITH_INVITATION] Step 1: Validating invitation...
🟢 [REGISTER_WITH_INVITATION] Invitation found: {id: '...', org: '...', status: 'pending'}
🟡 [REGISTER_WITH_INVITATION] Step 2: Creating auth user...
🟢 [REGISTER_WITH_INVITATION] Auth user created: 01ARZ3NDE-7-FAKE-UUID
🟡 [REGISTER_WITH_INVITATION] Step 3: Adding user to organization...
🟢 [REGISTER_WITH_INVITATION] User added to organization
🟡 [REGISTER_WITH_INVITATION] Step 4: Updating invitation status...
🟢 [REGISTER_WITH_INVITATION] Invitation marked as accepted
🟢 [REGISTER_WITH_INVITATION] ✅ SUCCESS: User registered and invitation accepted
```

**No errors should appear.** If you see 🔴 errors, screenshot them and share.

---

## 🐛 Troubleshooting

### Issue: Still getting "Token lookup failed: 400 Bad Request"
**Solution:**
- Execute the SQL from `CLEAN_RLS_FOR_INVITES.sql` in Supabase
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Try again in an incognito window

### Issue: Redirects to login after signup instead of dashboard
**Solution:**
- Check browser console for errors
- Verify Supabase client is configured correctly
- Check that session token is being set after signup

### Issue: Can't login with the new credentials
**Solution:**
- Check in Supabase that auth user exists with status `CONFIRMED`
- Check password requirements (min 8 chars)
- Try using the test email/password from signup
- Clear browser cache and try again

### Issue: Invitation not being accepted in database
**Solution:**
- Check server logs for endpoint errors
- Verify that the invitation record exists and has correct token
- Check RLS policies on `pending_invitations` table
- Look at Network tab in DevTools to see the response from `/api/v1/auth/register-with-invitation`

---

## 📊 Success Criteria

✅ **All of these should be true after Test 1:**
- [ ] Invitation link works
- [ ] Redirected to signup form
- [ ] Email is pre-filled
- [ ] Signup form shows organization name
- [ ] Registration completes
- [ ] Shown success message
- [ ] Redirected to dashboard within 2 seconds
- [ ] Dashboard loads and shows organization data
- [ ] Auth user status is `CONFIRMED` in Supabase
- [ ] `pending_invitations.status` is `'accepted'`
- [ ] `organization_members` has new entry
- [ ] Can logout
- [ ] Can login with credentials
- [ ] Can access dashboard after login

---

## 📝 Reporting Issues

If any test fails, please provide:
1. **Screenshot** of the error
2. **Browser console logs** (F12 → Console tab) - copy all 🔴 errors
3. **Network errors** (F12 → Network tab) - look for 400/422/500 responses
4. **Steps to reproduce** - exactly what you did
5. **Expected vs actual** - what should have happened vs what did

---

## 🎯 Next Steps

Once all tests pass:
- [ ] Mark as ✅ Complete
- [ ] Test other auth flows (regular signup, login, logout, Google OAuth)
- [ ] Test inviting multiple users
- [ ] Test role-based access (if member vs admin)
- [ ] Test organization switching (if multiple orgs)
