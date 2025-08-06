'use client';

import LoginForm from '@/components/LoginForm';
import AuthRedirect from '@/components/AuthRedirect';


export default function Home() {
  

  return (
    <div>

     
   
      <AuthRedirect />
      <LoginForm />
    </div>
  );
}
