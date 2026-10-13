import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Relax & Attack', description: 'Hand-drawn fighters. Fight a friend across sunny Tokyo cafés, arcades, and cherry blossom gardens. Room-code multiplayer with an optional solo adventure.', icons: {icon:'/favicon.svg'} };
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
