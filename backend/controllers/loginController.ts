import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";

// once the user is registered, we will create a session for them
// and set a JWT in an HTTP-only cookie. 
// After which, the user will then login and then create their own user profile (eg. name, monthly saving)
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    // 1. Create Supabase Auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto confirm email if needed
    });

    if (error) throw error;

    const authUserId = data.user?.id;

    // 2. Create user in your own `user` table (linking auth UUID)
    const { error: userError } = await supabase.from('user').insert([
      {user_id: authUserId,
      username: username
      }
    ]);

    if (userError) throw userError;

    res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Registration failed' });
    }
}

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const {data, error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { access_token } = data.session;

    // Set JWT in HTTP-only cookie
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: true, // set to true in production
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });
    res.status(200).json({ message: 'Login successful', token: access_token  });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
}

export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // set to true in production
      sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Logout failed' });
  }
}