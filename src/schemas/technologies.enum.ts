import { z } from 'zod';

export const LanguageEnum = z.enum([
    'PHP',
    'JAVASCRIPT',
    'TYPESCRIPT',
    'PYTHON',
    'GOLANG',
    'RUST',
    'JAVA',
    'KOTLIN',
    'DART',
    'CSHARP',
]);

export const DatabaseEnum = z.enum([
    'POSTGRESQL',
    'MYSQL',
    'MONGODB',
    'SQLITE',
    'FIREBASE',
    'REDIS',
]);

export const FrameworkEnum = z.enum([
    'REACT',
    'NEXTJS',
    'SOLIDJS',
    'SVELTE',
    'VUE',
    'NUXT',
    'LARAVEL',
    'DJANGO',
    'FLASK',
    'FASTAPI',
    'EXPRESS',
    'SPRING',
    'ACTIXWEB',
    'ROCKET',
    'FLUTTER',
    'DOTNET',
    'REACTNATIVE',
]);

export const LibraryEnum = z.enum([
    'REDUX',
    'ZUSTAND',
    'AXIOS',
    'DOCS',
    'TAILWIND',
    'SHADCN',
    'DAISYUI',
    'FRAMERMOTION',
    'GIT',
    'GITHUB',
    'CLICKUP',
    'REACTQUERY',
    'JQUERY',
    'MATERIALUI',
    'TAURI',
    'REST',
    'GRAPHQL',
    'GRPC',
]);

export const DeploymentEnum = z.enum([
    'DOCKER',
    'KUBERNETES',
    'GITHUB_ACTIONS',
    'SERVERLESS',
    'AWS',
    'HEROKU',
    'DIGITALOCEAN',
    'LINODE',
]);

export const TechnologyEnum = z.enum([
    'Language',
    'Database',
    'Framework',
    'Library',
    'Deployment',
]);

export const DepartmentEnum = z.enum([
    'BACKEND',
    'FRONTEND',
    'DATABASE',
    'GRAPHICS',
    'MARKETING',
    'MANAGEMENT',
    'FINANCE',
    'CONTENT',
    'PRESENTATION',
    'COMMUNICATION',
    'OTHERS',
]);
