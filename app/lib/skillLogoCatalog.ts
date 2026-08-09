export interface SkillLogoPreset {
  name: string;
  url: string;
  category: string;
  keywords?: string[];
}

const logo = (name: string, slug: string, category: string, keywords: string[] = []): SkillLogoPreset => ({
  name,
  category,
  keywords,
  url: `https://cdn.simpleicons.org/${slug}`,
});

const customSvgLogo = (
  name: string,
  category: string,
  primaryColor: string,
  secondaryColor: string,
  svgContent: string,
  keywords: string[] = []
): SkillLogoPreset => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="bg-${name.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${secondaryColor}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#bg-${name.replace(/[^a-zA-Z0-9]/g, '')})" />
      <g transform="translate(16, 16)">
        ${svgContent}
      </g>
    </svg>
  `;

  return {
    name,
    category,
    keywords: [...keywords, category.toLowerCase(), name.toLowerCase()],
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
  };
};

export const fallbackSkillLogo = (label: string) => {
  const cleaned = label.trim().replace(/[^A-Za-z0-9]+/g, ' ').split(/\s+/).filter(Boolean);
  const initials = cleaned.map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'S';
  const hueSeed = Array.from(label).reduce((total, character) => total + character.charCodeAt(0), 0) % 360;
  const primary = `hsl(${hueSeed}, 38%, 48%)`;
  const secondary = `hsl(${(hueSeed + 30) % 360}, 34%, 30%)`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="g-${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#g-${initials})" />
      <circle cx="64" cy="56" r="28" fill="rgba(255,255,255,0.16)" />
      <text x="64" y="66" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900" fill="#fffaf3">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
};

// Custom SVG Icons for Creative, Writing, AI & Specialized Tools
const SPECIALIZED_LOGOS: SkillLogoPreset[] = [
  customSvgLogo(
    'Content Writing',
    'Content',
    '#7a5f47',
    '#4a3728',
    `<rect x="16" y="8" width="64" height="80" rx="8" fill="#ffffff" fill-opacity="0.95" />
     <line x1="28" y1="28" x2="68" y2="28" stroke="#7a5f47" stroke-width="5" stroke-linecap="round" />
     <line x1="28" y1="44" x2="68" y2="44" stroke="#7a5f47" stroke-width="5" stroke-linecap="round" />
     <line x1="28" y1="60" x2="52" y2="60" stroke="#7a5f47" stroke-width="5" stroke-linecap="round" />
     <path d="M60 76 L84 44 L92 52 L68 84 Z" fill="#c4a884" stroke="#ffffff" stroke-width="2" />
     <path d="M60 76 L56 88 L68 84 Z" fill="#2f241b" />`,
    ['writing', 'content', 'copywriting', 'blog']
  ),
  customSvgLogo(
    'Story Writing',
    'Content',
    '#8d6b4e',
    '#5a4230',
    `<path d="M12 24 C 28 16, 44 24, 48 32 C 52 24, 68 16, 84 24 L 84 80 C 68 72, 52 80, 48 88 C 44 80, 28 72, 12 80 Z" fill="#ffffff" fill-opacity="0.9" stroke="#5a4230" stroke-width="3" />
     <line x1="48" y1="32" x2="48" y2="88" stroke="#8d6b4e" stroke-width="4" />
     <path d="M 66 12 L 70 20 L 78 22 L 72 28 L 74 36 L 66 32 L 58 36 L 60 28 L 54 22 L 62 20 Z" fill="#fcd34d" />`,
    ['story', 'narrative', 'creative', 'book']
  ),
  customSvgLogo(
    'Creative Writing',
    'Content',
    '#b6926d',
    '#725539',
    `<path d="M 72 12 C 48 36, 32 60, 24 88 L 36 88 C 44 68, 56 48, 76 24 Z" fill="#ffffff" fill-opacity="0.95" />
     <path d="M 24 88 L 16 94 L 28 92 Z" fill="#2f241b" />
     <path d="M 42 16 L 46 24 L 54 26 L 48 32 L 50 40 L 42 36 L 34 40 L 36 32 L 30 26 L 38 24 Z" fill="#fbbf24" />`,
    ['quill', 'creative', 'writing', 'author']
  ),
  customSvgLogo(
    'Video Editing',
    'Content',
    '#2563eb',
    '#1e3a8a',
    `<rect x="8" y="16" width="80" height="64" rx="10" fill="#ffffff" fill-opacity="0.9" />
     <path d="M 38 32 L 64 48 L 38 64 Z" fill="#2563eb" />
     <rect x="8" y="70" width="80" height="10" rx="3" fill="#60a5fa" />
     <line x1="48" y1="16" x2="48" y2="80" stroke="#ef4444" stroke-width="4" stroke-linecap="round" />`,
    ['video', 'editing', 'premiere', 'timeline']
  ),
  customSvgLogo(
    'Photo Editing',
    'Content',
    '#059669',
    '#064e3b',
    `<rect x="12" y="16" width="72" height="64" rx="12" fill="#ffffff" fill-opacity="0.9" />
     <circle cx="48" cy="48" r="20" fill="none" stroke="#059669" stroke-width="6" />
     <circle cx="48" cy="48" r="8" fill="#10b981" />
     <line x1="72" y1="28" x2="72" y2="68" stroke="#34d399" stroke-width="4" stroke-linecap="round" />
     <circle cx="72" cy="40" r="5" fill="#047857" />`,
    ['photo', 'editing', 'lightroom', 'aperture']
  ),
  customSvgLogo(
    'Prompt Engineering',
    'AI/ML',
    '#6366f1',
    '#312e81',
    `<rect x="8" y="12" width="80" height="72" rx="12" fill="#1e1b4b" stroke="#818cf8" stroke-width="3" />
     <text x="20" y="44" font-family="monospace" font-size="26" font-weight="bold" fill="#38bdf8">&gt;_</text>
     <path d="M 64 40 L 67 48 L 75 51 L 67 54 L 64 62 L 61 54 L 53 51 L 61 48 Z" fill="#fbbf24" />`,
    ['prompt', 'chatgpt', 'llm', 'ai']
  ),
  customSvgLogo(
    'AI-assisted Development',
    'AI/ML',
    '#4f46e5',
    '#1e1b4b',
    `<rect x="8" y="12" width="80" height="72" rx="12" fill="#ffffff" fill-opacity="0.95" />
     <path d="M 24 36 L 12 48 L 24 60" fill="none" stroke="#4f46e5" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
     <path d="M 72 36 L 84 48 L 72 60" fill="none" stroke="#4f46e5" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
     <path d="M 48 24 L 52 34 L 62 38 L 52 42 L 48 52 L 44 42 L 34 38 L 44 34 Z" fill="#a855f7" />`,
    ['ai', 'copilot', 'coding', 'development']
  ),
  customSvgLogo(
    'Google Gemini',
    'AI/ML',
    '#2563eb',
    '#7c3aed',
    `<path d="M 48 8 C 48 30, 66 48, 88 48 C 66 48, 48 66, 48 88 C 48 66, 30 48, 8 48 C 30 48, 48 30, 48 8 Z" fill="#ffffff" />
     <path d="M 64 24 C 64 36, 74 46, 86 46 C 74 46, 64 56, 64 68 C 64 56, 54 46, 42 46 C 54 46, 64 36, 64 24 Z" fill="#a855f7" />`,
    ['gemini', 'google', 'ai', 'llm']
  ),
  customSvgLogo(
    'Claude AI',
    'AI/ML',
    '#d97706',
    '#78350f',
    `<g transform="translate(48, 48)">
       <path d="M 0 -36 L 10 -10 L 36 0 L 10 10 L 0 36 L -10 10 L -36 0 L -10 -10 Z" fill="#ffffff" />
       <path d="M -22 -22 L -6 -6 L -6 -28 Z" fill="#fef3c7" />
       <path d="M 22 -22 L 6 -6 L 28 -6 Z" fill="#fef3c7" />
       <path d="M 22 22 L 6 6 L 6 28 Z" fill="#fef3c7" />
       <path d="M -22 22 L -6 6 L -28 6 Z" fill="#fef3c7" />
     </g>`,
    ['claude', 'anthropic', 'ai', 'llm']
  ),
  customSvgLogo(
    'Firebase Authentication',
    'Cloud',
    '#ffca28',
    '#f57c00',
    `<path d="M 24 16 L 72 16 L 72 72 L 24 72 Z" fill="#ffffff" fill-opacity="0.2" />
     <path d="M 20 80 L 44 12 L 60 40 L 76 24 L 48 88 Z" fill="#ffffff" />
     <rect x="36" y="44" width="24" height="24" rx="6" fill="#039be5" />
     <circle cx="48" cy="54" r="4" fill="#ffffff" />`,
    ['firebase', 'auth', 'authentication', 'cloud']
  ),
  customSvgLogo(
    'Firestore',
    'Database',
    '#ffca28',
    '#f57c00',
    `<path d="M 20 80 L 44 12 L 60 40 L 76 24 L 48 88 Z" fill="#ffffff" />
     <rect x="32" y="36" width="32" height="10" rx="3" fill="#ffa000" />
     <rect x="32" y="50" width="32" height="10" rx="3" fill="#ffb300" />
     <rect x="32" y="64" width="32" height="10" rx="3" fill="#ffe082" />`,
    ['firestore', 'firebase', 'database', 'nosql']
  ),
  customSvgLogo(
    'Firebase Storage',
    'Cloud',
    '#ffca28',
    '#f57c00',
    `<path d="M 20 80 L 44 12 L 60 40 L 76 24 L 48 88 Z" fill="#ffffff" />
     <path d="M 28 56 C 28 48, 36 44, 44 46 C 48 40, 60 40, 64 46 C 72 46, 76 52, 74 60 C 76 68, 68 72, 60 72 L 36 72 C 28 72, 24 64, 28 56 Z" fill="#0288d1" />`,
    ['storage', 'firebase', 'cloud', 'files']
  ),
  customSvgLogo(
    'Firebase Admin SDK',
    'Cloud',
    '#ffca28',
    '#f57c00',
    `<path d="M 20 80 L 44 12 L 60 40 L 76 24 L 48 88 Z" fill="#ffffff" />
     <rect x="28" y="44" width="40" height="28" rx="6" fill="#263238" />
     <text x="34" y="64" font-family="monospace" font-size="14" font-weight="bold" fill="#00e676">&gt;admin</text>`,
    ['firebase', 'admin', 'sdk', 'backend']
  ),
];

const CORE_LOGOS: SkillLogoPreset[] = [
  ...SPECIALIZED_LOGOS,
  logo('React', 'react', 'Frontend', ['react.js', 'reactjs']),
  logo('Next.js', 'nextdotjs', 'Frontend', ['next', 'nextjs']),
  logo('Vue.js', 'vuedotjs', 'Frontend'),
  logo('Nuxt', 'nuxt', 'Frontend'),
  logo('Svelte', 'svelte', 'Frontend'),
  logo('Angular', 'angular', 'Frontend'),
  logo('Tailwind CSS', 'tailwindcss', 'Frontend', ['tailwind']),
  logo('Bootstrap', 'bootstrap', 'Frontend'),
  logo('Material UI', 'mui', 'Frontend'),
  logo('Framer Motion', 'framer', 'Frontend', ['framer']),
  logo('HTML5', 'html5', 'Frontend', ['html']),
  logo('CSS3', 'css', 'Frontend', ['css']),
  logo('Sass', 'sass', 'Frontend'),
  logo('JavaScript', 'javascript', 'Languages', ['js']),
  logo('TypeScript', 'typescript', 'Languages', ['ts']),
  logo('Node.js', 'nodedotjs', 'Backend', ['node']),
  logo('Express', 'express', 'Backend'),
  logo('NestJS', 'nestjs', 'Backend'),
  logo('Django', 'django', 'Backend'),
  logo('Flask', 'flask', 'Backend'),
  logo('FastAPI', 'fastapi', 'Backend'),
  logo('Spring', 'spring', 'Backend'),
  logo('Laravel', 'laravel', 'Backend'),
  logo('Ruby on Rails', 'rubyonrails', 'Backend'),
  logo('GraphQL', 'graphql', 'Backend'),
  logo('Apollo GraphQL', 'apollographql', 'Backend'),
  logo('gRPC', 'grpc', 'Backend'),
  logo('MongoDB', 'mongodb', 'Database'),
  logo('PostgreSQL', 'postgresql', 'Database', ['postgres']),
  logo('MySQL', 'mysql', 'Database'),
  logo('SQLite', 'sqlite', 'Database'),
  logo('Redis', 'redis', 'Database'),
  logo('Supabase', 'supabase', 'Database'),
  logo('Firebase', 'firebase', 'Cloud'),
  logo('AWS', 'amazonwebservices', 'Cloud'),
  logo('Azure', 'microsoftazure', 'Cloud'),
  logo('Google Cloud', 'googlecloud', 'Cloud', ['gcp']),
  logo('Vercel', 'vercel', 'Cloud'),
  logo('Netlify', 'netlify', 'Cloud'),
  logo('Cloudflare', 'cloudflare', 'Cloud'),
  logo('DigitalOcean', 'digitalocean', 'Cloud'),
  logo('Docker', 'docker', 'DevOps'),
  logo('Kubernetes', 'kubernetes', 'DevOps', ['k8s']),
  logo('Terraform', 'terraform', 'DevOps'),
  logo('Ansible', 'ansible', 'DevOps'),
  logo('GitHub Actions', 'githubactions', 'DevOps'),
  logo('Jenkins', 'jenkins', 'DevOps'),
  logo('Prometheus', 'prometheus', 'DevOps'),
  logo('Grafana', 'grafana', 'DevOps'),
  logo('Git', 'git', 'Tools'),
  logo('GitHub', 'github', 'Tools'),
  logo('GitLab', 'gitlab', 'Tools'),
  logo('Bitbucket', 'bitbucket', 'Tools'),
  logo('VS Code', 'visualstudiocode', 'Tools', ['vscode']),
  logo('Visual Studio', 'visualstudio', 'Tools'),
  logo('IntelliJ IDEA', 'intellijidea', 'Tools'),
  logo('PyCharm', 'pycharm', 'Tools'),
  logo('WebStorm', 'webstorm', 'Tools'),
  logo('Postman', 'postman', 'Tools'),
  logo('Insomnia', 'insomnia', 'Tools'),
  logo('Figma', 'figma', 'Design'),
  logo('Canva', 'canva', 'Design'),
  logo('Adobe Photoshop', 'adobephotoshop', 'Design', ['photoshop']),
  logo('Adobe Illustrator', 'adobeillustrator', 'Design', ['illustrator', 'ai']),
  logo('Adobe Premiere Pro', 'adobepremierepro', 'Design', ['premiere', 'premiere pro']),
  logo('Adobe After Effects', 'adobeaftereffects', 'Design', ['after effects', 'ae']),
  logo('Adobe Lightroom', 'adobelightroom', 'Design', ['lightroom']),
  logo('Blender', 'blender', 'Design'),
  logo('DaVinci Resolve', 'davinciresolve', 'Design'),
  logo('Python', 'python', 'Languages'),
  logo('Java', 'openjdk', 'Languages'),
  logo('C', 'c', 'Languages', ['c lang', 'c language']),
  logo('C++', 'cplusplus', 'Languages', ['cpp']),
  logo('C#', 'csharp', 'Languages', ['csharp']),
  logo('Go', 'go', 'Languages', ['golang']),
  logo('Rust', 'rust', 'Languages'),
  logo('Kotlin', 'kotlin', 'Languages'),
  logo('Swift', 'swift', 'Languages'),
  logo('Dart', 'dart', 'Languages'),
  logo('PHP', 'php', 'Languages'),
  logo('Ruby', 'ruby', 'Languages'),
  logo('R', 'r', 'Languages'),
  logo('MATLAB', 'mathworks', 'Languages'),
  logo('NumPy', 'numpy', 'Data'),
  logo('Pandas', 'pandas', 'Data'),
  logo('Jupyter', 'jupyter', 'Data'),
  logo('Apache Spark', 'apachespark', 'Data'),
  logo('TensorFlow', 'tensorflow', 'AI/ML'),
  logo('PyTorch', 'pytorch', 'AI/ML'),
  logo('scikit-learn', 'scikitlearn', 'AI/ML'),
  logo('OpenAI', 'openai', 'AI/ML', ['chatgpt', 'gpt']),
  logo('GitHub Copilot', 'githubcopilot', 'AI/ML', ['copilot']),
  logo('Hugging Face', 'huggingface', 'AI/ML'),
  logo('LangChain', 'langchain', 'AI/ML'),
  logo('Linux', 'linux', 'Platform'),
  logo('Ubuntu', 'ubuntu', 'Platform'),
  logo('Windows', 'windows', 'Platform'),
  logo('macOS', 'apple', 'Platform'),
  logo('Android', 'android', 'Mobile'),
  logo('iOS', 'ios', 'Mobile'),
  logo('React Native', 'react', 'Mobile'),
  logo('Flutter', 'flutter', 'Mobile'),
  logo('Expo', 'expo', 'Mobile'),
  logo('Electron', 'electron', 'Desktop'),
  logo('Tauri', 'tauri', 'Desktop'),
  logo('NPM', 'npm', 'Package Managers'),
  logo('Yarn', 'yarn', 'Package Managers'),
  logo('pnpm', 'pnpm', 'Package Managers'),
  logo('Vite', 'vite', 'Build Tools'),
  logo('Webpack', 'webpack', 'Build Tools'),
  logo('Babel', 'babel', 'Build Tools'),
  logo('ESLint', 'eslint', 'Build Tools'),
  logo('Prettier', 'prettier', 'Build Tools'),
  logo('Jest', 'jest', 'Testing'),
  logo('Cypress', 'cypress', 'Testing'),
  logo('Playwright', 'playwright', 'Testing'),
  logo('Storybook', 'storybook', 'Testing'),
  logo('Selenium', 'selenium', 'Testing'),
  logo('Copywriting', 'grammarly', 'Content'),
  logo('SEO', 'googlesearchconsole', 'Content'),
  logo('YouTube', 'youtube', 'Content'),
  logo('Instagram', 'instagram', 'Content'),
  logo('LinkedIn', 'linkedin', 'Content'),
  logo('X (Twitter)', 'x', 'Content'),
  logo('Facebook', 'facebook', 'Content'),
  logo('TikTok', 'tiktok', 'Content'),
  logo('Pinterest', 'pinterest', 'Content'),
  logo('Discord', 'discord', 'Content'),
  logo('Slack', 'slack', 'Content'),
];

const EXTENDED_LOGOS: SkillLogoPreset[] = [
  logo('Astro', 'astro', 'Frontend'),
  logo('SolidJS', 'solid', 'Frontend'),
  logo('Qwik', 'qwik', 'Frontend'),
  logo('Alpine.js', 'alpinedotjs', 'Frontend'),
  logo('Lit', 'lit', 'Frontend'),
  logo('jQuery', 'jquery', 'Frontend'),
  logo('Three.js', 'threedotjs', 'Frontend'),
  logo('D3.js', 'd3dotjs', 'Frontend'),
  logo('Redux', 'redux', 'Frontend'),
  logo('Zustand', 'zustand', 'Frontend'),
  logo('React Query', 'reactquery', 'Frontend'),
  logo('Styled Components', 'styledcomponents', 'Frontend'),
  logo('Emotion', 'emotion', 'Frontend'),
  logo('Chakra UI', 'chakraui', 'Frontend'),
  logo('Ant Design', 'antdesign', 'Frontend'),
  logo('Radix UI', 'radixui', 'Frontend'),
  logo('Shadcn UI', 'shadcnui', 'Frontend'),
  logo('SWR', 'swr', 'Frontend'),
  logo('Prisma', 'prisma', 'Backend'),
  logo('Drizzle', 'drizzle', 'Backend'),
  logo('Sequelize', 'sequelize', 'Backend'),
  logo('TypeORM', 'typeorm', 'Backend'),
  logo('Mongoose', 'mongoose', 'Backend'),
  logo('Koa', 'koa', 'Backend'),
  logo('Hapi', 'hapi', 'Backend'),
  logo('Bun', 'bun', 'Backend'),
  logo('Deno', 'deno', 'Backend'),
  logo('Socket.IO', 'socketdotio', 'Backend'),
  logo('tRPC', 'trpc', 'Backend'),
  logo('RabbitMQ', 'rabbitmq', 'Backend'),
  logo('Apache Kafka', 'apachekafka', 'Backend'),
  logo('NATS', 'natsdotio', 'Backend'),
  logo('BullMQ', 'redis', 'Backend'),
  logo('Celery', 'celery', 'Backend'),
  logo('Apache Airflow', 'apacheairflow', 'Data'),
  logo('dbt', 'dbt', 'Data'),
  logo('Snowflake', 'snowflake', 'Data'),
  logo('BigQuery', 'googlebigquery', 'Data'),
  logo('Databricks', 'databricks', 'Data'),
  logo('Looker', 'looker', 'Data'),
  logo('Metabase', 'metabase', 'Data'),
  logo('ClickHouse', 'clickhouse', 'Database'),
  logo('MariaDB', 'mariadb', 'Database'),
  logo('Couchbase', 'couchbase', 'Database'),
  logo('Cassandra', 'apachecassandra', 'Database'),
  logo('Neo4j', 'neo4j', 'Database'),
  logo('Elasticsearch', 'elasticsearch', 'Database'),
  logo('OpenSearch', 'opensearch', 'Database'),
  logo('Meilisearch', 'meilisearch', 'Database'),
  logo('PlanetScale', 'planetscale', 'Database'),
  logo('CockroachDB', 'cockroachlabs', 'Database'),
  logo('Timescale', 'timescale', 'Database'),
  logo('Vault', 'vault', 'DevOps'),
  logo('Consul', 'consul', 'DevOps'),
  logo('Nomad', 'nomad', 'DevOps'),
  logo('ArgoCD', 'argo', 'DevOps'),
  logo('Pulumi', 'pulumi', 'DevOps'),
  logo('Helm', 'helm', 'DevOps'),
  logo('CircleCI', 'circleci', 'DevOps'),
  logo('Travis CI', 'travisci', 'DevOps'),
  logo('Perplexity', 'perplexity', 'AI/ML'),
  logo('Anthropic', 'anthropic', 'AI/ML'),
  logo('Cohere', 'cohere', 'AI/ML'),
  logo('Mistral AI', 'mistralai', 'AI/ML'),
  logo('Weights & Biases', 'weightsandbiases', 'AI/ML'),
  logo('MLflow', 'mlflow', 'AI/ML'),
  logo('Keras', 'keras', 'AI/ML'),
  logo('ONNX', 'onnx', 'AI/ML'),
  logo('NVIDIA', 'nvidia', 'AI/ML'),
  logo('CUDA', 'nvidia', 'AI/ML'),
  logo('Unity', 'unity', 'Game'),
  logo('Unreal Engine', 'unrealengine', 'Game'),
  logo('Godot', 'godotengine', 'Game'),
  logo('Steam', 'steam', 'Game'),
  logo('Arduino', 'arduino', 'Hardware'),
  logo('Raspberry Pi', 'raspberrypi', 'Hardware'),
  logo('ESPHome', 'esphome', 'Hardware'),
  logo('PlatformIO', 'platformio', 'Hardware'),
  logo('Home Assistant', 'homeassistant', 'Hardware'),
  logo('IoT', 'internetofthings', 'Hardware'),
  logo('Linux Mint', 'linuxmint', 'Platform'),
  logo('Debian', 'debian', 'Platform'),
  logo('Fedora', 'fedora', 'Platform'),
  logo('CentOS', 'centos', 'Platform'),
  logo('Arch Linux', 'archlinux', 'Platform'),
  logo('Kali Linux', 'kalilinux', 'Platform'),
  logo('WSL', 'linux', 'Platform'),
  logo('Heroku', 'heroku', 'Cloud'),
  logo('Render', 'render', 'Cloud'),
  logo('Railway', 'railway', 'Cloud'),
  logo('Fly.io', 'flydotio', 'Cloud'),
  logo('Linode', 'linode', 'Cloud'),
  logo('OVHcloud', 'ovh', 'Cloud'),
  logo('Cloudinary', 'cloudinary', 'Cloud'),
  logo('Sentry', 'sentry', 'Monitoring'),
  logo('Datadog', 'datadog', 'Monitoring'),
  logo('New Relic', 'newrelic', 'Monitoring'),
  logo('Bugsnag', 'bugsnag', 'Monitoring'),
  logo('LogRocket', 'logrocket', 'Monitoring'),
  logo('PagerDuty', 'pagerduty', 'Monitoring'),
  logo('SonarQube', 'sonarqube', 'Testing'),
  logo('Vitest', 'vitest', 'Testing'),
  logo('Mocha', 'mocha', 'Testing'),
  logo('Chai', 'chai', 'Testing'),
  logo('Testing Library', 'testinglibrary', 'Testing'),
  logo('Cucumber', 'cucumber', 'Testing'),
  logo('Appium', 'appium', 'Testing'),
  logo('BrowserStack', 'browserstack', 'Testing'),
  logo('Codecov', 'codecov', 'Testing'),
  logo('Sonatype', 'sonatype', 'Testing'),
  logo('Gulp', 'gulp', 'Build Tools'),
  logo('Grunt', 'grunt', 'Build Tools'),
  logo('Rollup', 'rollupdotjs', 'Build Tools'),
  logo('Parcel', 'parcel', 'Build Tools'),
  logo('Turborepo', 'turborepo', 'Build Tools'),
  logo('Nx', 'nx', 'Build Tools'),
  logo('Lerna', 'lerna', 'Build Tools'),
  logo('Bun PM', 'bun', 'Package Managers'),
  logo('Composer', 'composer', 'Package Managers'),
  logo('Poetry', 'poetry', 'Package Managers'),
  logo('Pip', 'pypi', 'Package Managers'),
  logo('Conda', 'anaconda', 'Package Managers'),
  logo('Homebrew', 'homebrew', 'Package Managers'),
  logo('Chocolatey', 'chocolatey', 'Package Managers'),
  logo('pnpm Workspaces', 'pnpm', 'Package Managers'),
  logo('OpenCV', 'opencv', 'AI/ML'),
  logo('Scipy', 'scipy', 'AI/ML'),
  logo('Pydantic', 'pydantic', 'AI/ML'),
  logo('Prefect', 'prefect', 'AI/ML'),
  logo('Ray', 'ray', 'AI/ML'),
  logo('Gradio', 'gradio', 'AI/ML'),
  logo('Streamlit', 'streamlit', 'AI/ML'),
  logo('H2O.ai', 'h2o', 'AI/ML'),
  logo('Apache MXNet', 'apachemxnet', 'AI/ML'),
  logo('Dataiku', 'dataiku', 'AI/ML'),
  logo('Kaggle', 'kaggle', 'AI/ML'),
  logo('Weights & Biases Sweeps', 'weightsandbiases', 'AI/ML'),
  logo('Obsidian', 'obsidian', 'Productivity'),
  logo('Airtable', 'airtable', 'Productivity'),
  logo('Monday.com', 'mondaydotcom', 'Productivity'),
  logo('Confluence', 'confluence', 'Productivity'),
  logo('Linear', 'linear', 'Productivity'),
  logo('Todoist', 'todoist', 'Productivity'),
  logo('Evernote', 'evernote', 'Productivity'),
  logo('Google Workspace', 'googleworkspace', 'Productivity'),
  logo('Microsoft 365', 'microsoft365', 'Productivity'),
  logo('Teams', 'microsoftteams', 'Productivity'),
  logo('Zoom', 'zoom', 'Productivity'),
  logo('Loom', 'loom', 'Productivity'),
  logo('Calendly', 'calendly', 'Productivity'),
  logo('HubSpot', 'hubspot', 'Marketing'),
  logo('Mailchimp', 'mailchimp', 'Marketing'),
  logo('Brevo', 'brevo', 'Marketing'),
  logo('ConvertKit', 'convertkit', 'Marketing'),
  logo('Substack', 'substack', 'Marketing'),
  logo('Buffer', 'buffer', 'Marketing'),
  logo('Hootsuite', 'hootsuite', 'Marketing'),
  logo('Semrush', 'semrush', 'Marketing'),
  logo('Ahrefs', 'ahrefs', 'Marketing'),
  logo('Google Ads', 'googleads', 'Marketing'),
  logo('Meta Ads', 'meta', 'Marketing'),
  logo('Analytics', 'googleanalytics', 'Analytics'),
  logo('Amplitude', 'amplitude', 'Analytics'),
  logo('Mixpanel', 'mixpanel', 'Analytics'),
  logo('Heap', 'heap', 'Analytics'),
  logo('Hotjar', 'hotjar', 'Analytics'),
  logo('Plausible', 'plausibleanalytics', 'Analytics'),
  logo('Matomo', 'matomo', 'Analytics'),
  logo('Umami', 'umami', 'Analytics'),
  logo('Grafana Loki', 'grafana', 'Monitoring'),
  logo('Kibana', 'kibana', 'Monitoring'),
  logo('Jaeger', 'jaeger', 'Monitoring'),
  logo('OpenTelemetry', 'opentelemetry', 'Monitoring'),
  logo('Promtail', 'prometheus', 'Monitoring'),
  logo('Figma FigJam', 'figma', 'Design'),
  logo('Sketch', 'sketch', 'Design'),
  logo('InVision', 'invision', 'Design'),
  logo('Adobe XD', 'adobexd', 'Design'),
  logo('Adobe Audition', 'adobeaudition', 'Design'),
  logo('Adobe Animate', 'adobeanimate', 'Design'),
  logo('Adobe InDesign', 'adobeindesign', 'Design'),
  logo('CorelDRAW', 'coreldraw', 'Design'),
  logo('Cinema 4D', 'cinema4d', 'Design'),
  logo('Autodesk', 'autodesk', 'Design'),
  logo('SketchUp', 'sketchup', 'Design'),
  logo('OBS Studio', 'obsstudio', 'Content'),
  logo('DaVinci Fusion', 'davinciresolve', 'Content'),
  logo('CapCut', 'capcut', 'Content'),
  logo('Shotcut', 'shotcut', 'Content'),
  logo('Audacity', 'audacity', 'Content'),
  logo('Spotify', 'spotify', 'Content'),
  logo('Anchor', 'anchor', 'Content'),
  logo('Vimeo', 'vimeo', 'Content'),
  logo('Twitch', 'twitch', 'Content'),
  logo('Behance', 'behance', 'Content'),
  logo('Dribbble', 'dribbble', 'Content'),
  logo('Medium', 'medium', 'Content'),
  logo('Dev.to', 'devdotto', 'Content'),
  logo('Hashnode', 'hashnode', 'Content'),
  logo('Reddit', 'reddit', 'Content'),
  logo('Quora', 'quora', 'Content'),
  logo('WhatsApp', 'whatsapp', 'Content'),
  logo('Telegram', 'telegram', 'Content'),
  logo('Signal', 'signal', 'Content'),
  logo('Messenger', 'messenger', 'Content'),
  logo('Snapchat', 'snapchat', 'Content'),
  logo('Threads', 'threads', 'Content'),
  logo('Xing', 'xing', 'Content'),
  logo('Patreon', 'patreon', 'Content'),
  logo('Buy Me A Coffee', 'buymeacoffee', 'Content'),
  logo('Ko-fi', 'kofi', 'Content'),
  logo('Amazon', 'amazon', 'Commerce'),
  logo('eBay', 'ebay', 'Commerce'),
  logo('Etsy', 'etsy', 'Commerce'),
  logo('OpenCart', 'opencart', 'Commerce'),
  logo('Magento', 'magento', 'Commerce'),
  logo('BigCommerce', 'bigcommerce', 'Commerce'),
  logo('PrestaShop', 'prestashop', 'Commerce'),
  logo('Square', 'square', 'Commerce'),
  logo('Wise', 'wise', 'Commerce'),
  logo('Payoneer', 'payoneer', 'Commerce'),
  logo('Adyen', 'adyen', 'Commerce'),
  logo('Mercado Pago', 'mercadopago', 'Commerce'),
  logo('WordPress Gutenberg', 'wordpress', 'CMS'),
  logo('Webflow', 'webflow', 'CMS'),
  logo('Framer Sites', 'framer', 'CMS'),
  logo('Wix', 'wix', 'CMS'),
  logo('Squarespace', 'squarespace', 'CMS'),
  logo('Contentful', 'contentful', 'CMS'),
  logo('Hygraph', 'hygraph', 'CMS'),
  logo('Storyblok', 'storyblok', 'CMS'),
  logo('DatoCMS', 'datocms', 'CMS'),
  logo('Keystone', 'keystone', 'CMS'),
  logo('Directus', 'directus', 'CMS'),
  logo('Payload CMS', 'payloadcms', 'CMS'),
  logo('Shopware', 'shopware', 'Commerce'),
  logo('Salesforce', 'salesforce', 'Business'),
  logo('SAP', 'sap', 'Business'),
  logo('Oracle', 'oracle', 'Business'),
  logo('ServiceNow', 'servicenow', 'Business'),
  logo('Stripe Connect', 'stripe', 'Business'),
  logo('Intercom', 'intercom', 'Business'),
  logo('Zendesk', 'zendesk', 'Business'),
  logo('Freshworks', 'freshworks', 'Business'),
  logo('Zoho', 'zoho', 'Business'),
  logo('QuickBooks', 'quickbooks', 'Business'),
  logo('Xero', 'xero', 'Business'),
  logo('Notepad++', 'notepadplusplus', 'Tools'),
  logo('Sublime Text', 'sublimetext', 'Tools'),
  logo('Vim', 'vim', 'Tools'),
  logo('Neovim', 'neovim', 'Tools'),
  logo('Emacs', 'gnuemacs', 'Tools'),
  logo('JetBrains', 'jetbrains', 'Tools'),
  logo('Android Studio', 'androidstudio', 'Tools'),
  logo('Xcode', 'xcode', 'Tools'),
  logo('CLion', 'clion', 'Tools'),
  logo('Rider', 'rider', 'Tools'),
  logo('Webflow Designer', 'webflow', 'Tools'),
  logo('Docker Desktop', 'docker', 'Tools'),
  logo('K9s', 'kubernetes', 'Tools'),
  logo('DBeaver', 'dbeaver', 'Tools'),
  logo('TablePlus', 'tableplus', 'Tools'),
  logo('MongoDB Compass', 'mongodb', 'Tools'),
  logo('FileZilla', 'filezilla', 'Tools'),
  logo('Termius', 'termius', 'Tools'),
  logo('Hyper', 'hyper', 'Tools'),
  logo('iTerm2', 'iterm2', 'Tools'),
  logo('PowerShell', 'powershell', 'Tools'),
  logo('Bash', 'gnubash', 'Tools'),
  logo('Zsh', 'zsh', 'Tools'),
  logo('Tmux', 'tmux', 'Tools'),
  logo('Nginx', 'nginx', 'Backend'),
  logo('Apache HTTP Server', 'apache', 'Backend'),
  logo('Caddy', 'caddy', 'Backend'),
  logo('Traefik', 'traefikproxy', 'Backend'),
  logo('HAProxy', 'haproxy', 'Backend'),
  logo('Gunicorn', 'gunicorn', 'Backend'),
  logo('Uvicorn', 'fastapi', 'Backend'),
  logo('PM2', 'pm2', 'Backend'),
  logo('SvelteKit', 'svelte', 'Frontend'),
  logo('Remix', 'remix', 'Frontend'),
  logo('Gatsby', 'gatsby', 'Frontend'),
  logo('Astro Starlight', 'astro', 'Frontend'),
  logo('Ionic', 'ionic', 'Mobile'),
  logo('Cordova', 'apachecordova', 'Mobile'),
  logo('Xamarin', 'xamarin', 'Mobile'),
  logo('Expo Router', 'expo', 'Mobile'),
  logo('React Navigation', 'react', 'Mobile'),
  logo('CocoaPods', 'cocoapods', 'Mobile'),
  logo('Fastlane', 'fastlane', 'Mobile'),
  logo('Gradle', 'gradle', 'Build Tools'),
  logo('Maven', 'apachemaven', 'Build Tools'),
  logo('Bazel', 'bazel', 'Build Tools'),
  logo('CMake', 'cmake', 'Build Tools'),
  logo('Meson', 'meson', 'Build Tools'),
  logo('Ninja', 'ninja', 'Build Tools'),
  logo('GNU Make', 'gnu', 'Build Tools'),
  logo('RubyGems', 'rubygems', 'Package Managers'),
  logo('NuGet', 'nuget', 'Package Managers'),
  logo('Maven Central', 'apachemaven', 'Package Managers'),
  logo('Cargo', 'rust', 'Package Managers'),
  logo('Crates.io', 'rust', 'Package Managers'),
  logo('Go Modules', 'go', 'Package Managers'),
  logo('Apt', 'debian', 'Package Managers'),
  logo('Yum', 'redhat', 'Package Managers'),
  logo('Pacman', 'archlinux', 'Package Managers'),
  logo('OpenAPI', 'openapiinitiative', 'Backend'),
  logo('Swagger', 'swagger', 'Backend'),
  logo('Insomnia Designer', 'insomnia', 'Backend'),
  logo('PostgREST', 'postgrest', 'Backend'),
  logo('Hasura', 'hasura', 'Backend'),
  logo('Auth0', 'auth0', 'Security'),
  logo('Okta', 'okta', 'Security'),
  logo('Keycloak', 'keycloak', 'Security'),
  logo('Cloudflare Zero Trust', 'cloudflare', 'Security'),
  logo('Fortinet', 'fortinet', 'Security'),
  logo('CrowdStrike', 'crowdstrike', 'Security'),
  logo('OWASP', 'owasp', 'Security'),
  logo('Burp Suite', 'burpsuite', 'Security'),
  logo('Kali Tools', 'kalilinux', 'Security'),
  logo('Wireshark', 'wireshark', 'Security'),
  logo('Nmap', 'nmap', 'Security'),
  logo('Security Headers', 'shield', 'Security', ['csp', 'x-frame-options', 'hsts']),
];

const deduped = new Map<string, SkillLogoPreset>();

for (const item of [...CORE_LOGOS, ...EXTENDED_LOGOS]) {
  const key = item.name.trim().toLowerCase();
  if (!deduped.has(key)) {
    deduped.set(key, item);
  }
}

export const SKILL_LOGO_PRESETS: SkillLogoPreset[] = Array.from(deduped.values());

export const SKILL_LOGO_CATEGORIES = [
  'All',
  ...Array.from(new Set(SKILL_LOGO_PRESETS.map((preset) => preset.category))).sort((a, b) => a.localeCompare(b)),
];

export const SKILL_LOGO_LOOKUP = Object.fromEntries(
  SKILL_LOGO_PRESETS.map((item) => [item.name.toLowerCase(), item.url])
);

// Comprehensive Alias Lookup Table
export const SKILL_ALIAS_MAP: Record<string, string> = {
  // Programming & Languages
  "c": "C",
  "c lang": "C",
  "c language": "C",
  "c programming": "C",
  "python": "Python",
  "java": "Java",
  "html": "HTML5",
  "html5": "HTML5",
  "css": "CSS3",
  "css3": "CSS3",
  "js": "JavaScript",
  "javascript": "JavaScript",
  "ts": "TypeScript",
  "typescript": "TypeScript",
  "react": "React",
  "react.js": "React",
  "reactjs": "React",
  "next": "Next.js",
  "next.js": "Next.js",
  "nextjs": "Next.js",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  "framer": "Framer Motion",
  "framer motion": "Framer Motion",

  // Backend & Cloud & DB
  "firebase": "Firebase",
  "firebase auth": "Firebase Authentication",
  "firebase authentication": "Firebase Authentication",
  "firestore": "Firestore",
  "firebase firestore": "Firestore",
  "firebase storage": "Firebase Storage",
  "firebase admin": "Firebase Admin SDK",
  "firebase admin sdk": "Firebase Admin SDK",
  "vercel": "Vercel",
  "postman": "Postman",

  // Dev Tools & VCS
  "git": "Git",
  "github": "GitHub",
  "copilot": "GitHub Copilot",
  "github copilot": "GitHub Copilot",
  "vscode": "VS Code",
  "vs code": "VS Code",
  "visual studio code": "VS Code",

  // AI & GenAI
  "chatgpt": "OpenAI",
  "gpt": "OpenAI",
  "openai": "OpenAI",
  "gemini": "Google Gemini",
  "google gemini": "Google Gemini",
  "claude": "Claude AI",
  "claude ai": "Claude AI",
  "prompting": "Prompt Engineering",
  "prompt engineering": "Prompt Engineering",
  "ai-assisted development": "AI-assisted Development",
  "ai assisted development": "AI-assisted Development",
  "ai development": "AI-assisted Development",

  // Creative & Design
  "canva": "Canva",
  "figma": "Figma",
  "premiere": "Adobe Premiere Pro",
  "premiere pro": "Adobe Premiere Pro",
  "adobe premiere": "Adobe Premiere Pro",
  "adobe premiere pro": "Adobe Premiere Pro",
  "after effects": "Adobe After Effects",
  "adobe after effects": "Adobe After Effects",
  "ae": "Adobe After Effects",
  "adobe ae": "Adobe After Effects",
  "illustrator": "Adobe Illustrator",
  "adobe illustrator": "Adobe Illustrator",
  "ai design": "Adobe Illustrator",
  "lightroom": "Adobe Lightroom",
  "adobe lightroom": "Adobe Lightroom",
  "lr": "Adobe Lightroom",

  // Content & Writing
  "content writing": "Content Writing",
  "story writing": "Story Writing",
  "creative writing": "Creative Writing",
  "video editing": "Video Editing",
  "photo editing": "Photo Editing",
};

export function resolveSkillIconUrl(iconValue?: string, titleFallback?: string) {
  const value = (iconValue || titleFallback || '').trim();
  if (!value) return fallbackSkillLogo('Skill');

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/')) {
    return value;
  }

  const normalized = value.toLowerCase();

  if (SKILL_LOGO_LOOKUP[normalized]) {
    return SKILL_LOGO_LOOKUP[normalized];
  }

  const canonicalName = SKILL_ALIAS_MAP[normalized];
  if (canonicalName && SKILL_LOGO_LOOKUP[canonicalName.toLowerCase()]) {
    return SKILL_LOGO_LOOKUP[canonicalName.toLowerCase()];
  }

  if (titleFallback && titleFallback !== iconValue) {
    const titleNorm = titleFallback.trim().toLowerCase();
    if (SKILL_LOGO_LOOKUP[titleNorm]) return SKILL_LOGO_LOOKUP[titleNorm];
    const aliasTitle = SKILL_ALIAS_MAP[titleNorm];
    if (aliasTitle && SKILL_LOGO_LOOKUP[aliasTitle.toLowerCase()]) {
      return SKILL_LOGO_LOOKUP[aliasTitle.toLowerCase()];
    }
  }

  return fallbackSkillLogo(value);
}
