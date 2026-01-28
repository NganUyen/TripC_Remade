interface Props {
    onSelect: (method: string) => void;
    disabled?: boolean;
}

export const PaymentMethodSelector = ({ onSelect, disabled }: Props) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Payment Method</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => onSelect('momo')}
                    disabled={disabled}
                    className="flex items-center justify-center p-4 border rounded-xl hover:bg-pink-50 border-pink-200 transition-all group"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-medium text-pink-700">Pay with MoMo</span>
                        <span className="text-xs text-pink-500">Scan QR Code</span>
                    </div>
                </button>

                <button
                    onClick={() => onSelect('vnpay')}
                    disabled={disabled}
                    className="flex items-center justify-center p-4 border rounded-xl hover:bg-blue-50 border-blue-200 transition-all opacity-50 cursor-not-allowed"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-medium text-blue-700">Pay with VNPAY</span>
                        <span className="text-xs text-blue-500">Coming Soon</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
