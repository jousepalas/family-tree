// src/components/PhoneNumberInput.tsx
"use client";

import React from 'react';
// Import the main component and Value type from the correct path
import PhoneInput, { type Value } from 'react-phone-number-input/input';
import 'react-phone-number-input/style.css'; // Import base styles
import { cn } from '@/lib/utils';

interface PhoneNumberInputProps {
    value: Value | undefined;
    onChange: (value: Value | undefined) => void;
    defaultCountry?: string; // e.g., "US"
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
}

// Define a simple forwardRef component rendering a standard HTML input
// This component receives props from PhoneInput and forwards them, along with the ref
const CustomHtmlInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
        {...props} // Spread all received props (value, onChange, onFocus, onBlur, type, etc.)
        ref={ref}  // Forward the ref to the actual input element
        // Apply the desired class name for styling from globals.css
        className="PhoneInputInput"
    />
));
CustomHtmlInput.displayName = 'CustomHtmlInput'; // Good practice for DevTools


const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
    value,
    onChange,
    defaultCountry = "US",
    className,
    disabled,
    placeholder = "Enter phone number",
    id
}) => {
    return (
        // Use the PhoneInput component imported from 'react-phone-number-input/input'
        // This is the version "without country select" by default, but we add the select via props
        <PhoneInput
            id={id}
            className={cn("PhoneInput", className)} // Wrapper class for the whole component
            // Props specifically for the country select part (these seem to be implicitly handled
            // when using the /input export based on other props like defaultCountry)
            // We style the parts via CSS classes defined in globals.css
            countrySelectComponentProps={{
                className: "PhoneInputCountry",
                iconClassName: "PhoneInputCountryIcon",
                arrowClassName: "PhoneInputCountrySelectArrow"
            }}
            international // Keep international formatting
            withCountryCallingCode // Show the country code prefix
            displayInitialValueAsLocalNumber={!value?.startsWith('+')} // Format initial value nicely if it's national
            defaultCountry={defaultCountry as any} // Set the default country
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            // Pass the standard HTML input wrapper to inputComponent
            inputComponent={CustomHtmlInput} // Use our custom input renderer
            // Add other relevant props that should pass through to the input
            type="tel"
            autoComplete="tel"
        />
    );
};

export default PhoneNumberInput;