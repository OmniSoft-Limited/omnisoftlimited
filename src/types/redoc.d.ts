declare global {
    namespace JSX {
        interface IntrinsicElements {
            redoc: React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            > & {
                "spec-url"?: string;
            };
        }
    }
}

export {};
