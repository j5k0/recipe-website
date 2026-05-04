export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Filenames must start with a lowercase letter',
        },
        schema: [],
    },
    create(context) {
        return {
            Program() {
                const filename = context.getFilename();
        
                // Extract just the filename without the path
                const basename = filename.split('/').pop();

                if (/^[A-Z]/.test(basename)) {
                context.report({
                        loc: { line: 1, column: 0 },
                        message: `File "{{ name }}" must start with a lowercase letter.`,
                        data: { name: basename },
                    });
                }
            }
        };
    }
};
