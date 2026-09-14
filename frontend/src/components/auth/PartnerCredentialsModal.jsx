import { Copy, CheckCircle2, Heart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function PartnerCredentialsModal({
    open,
    onClose,
    partner,
}) {
    const [copied, setCopied] = useState(false);

    if (!open || !partner) return null;

    const copyPassword = async () => {
        await navigator.clipboard.writeText(partner.temporaryPassword);
        setCopied(true);
        toast.success("Temporary password copied!");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

                <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                        <Heart className="text-pink-500" size={32} />
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-pink-600">
                        Couple Account Created 💖
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Share these login details with your partner.
                    </p>
                </div>

                <div className="mt-6 space-y-4">

                    <div className="rounded-xl bg-pink-50 p-4">
                        <p className="text-xs text-gray-500">Partner Name</p>
                        <p className="font-semibold">{partner.name}</p>
                    </div>

                    <div className="rounded-xl bg-pink-50 p-4">
                        <p className="text-xs text-gray-500">Partner Mobile</p>
                        <p className="font-semibold">{partner.mobileNumber}</p>
                    </div>

                    <div className="rounded-xl bg-purple-50 p-4">
                        <p className="text-xs text-gray-500">Temporary Password</p>

                        <div className="flex items-center justify-between mt-2">
                            <p className="font-mono text-lg font-bold text-purple-700">
                                {partner.temporaryPassword}
                            </p>

                            <button
                                onClick={copyPassword}
                                className="rounded-lg bg-purple-600 text-white px-3 py-2 flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 size={18} /> Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} /> Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3">
                        <p className="text-sm text-yellow-700">
                            ⚠️ This password is shown only once. Your partner will create a new password on first login.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-pink-600 py-3 text-white font-semibold"
                    >
                        Continue to Dashboard
                    </button>

                </div>
            </div>
        </div>
    );
}