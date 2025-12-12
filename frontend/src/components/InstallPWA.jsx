import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // DEV ONLY: Uncomment to test UI
        // setSupportsPWA(true); 

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = async () => {
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            toast.success('Installation accepted!');
        }
        setPromptInstall(null);
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom duration-500">
            <Button
                onClick={onClick}
                className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-6 h-auto flex gap-2 items-center border-2 border-white"
            >
                <Download className="w-5 h-5" />
                <div className="flex flex-col items-start">
                    <span className="text-sm font-bold leading-none">Install App</span>
                    <span className="text-[10px] opacity-80 leading-none mt-1">Get the App</span>
                </div>
            </Button>
        </div>
    );
};

export default InstallPWA;
