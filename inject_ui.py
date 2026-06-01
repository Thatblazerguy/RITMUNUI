import os
import glob
import re

css_code = """
        /* Scroll Progress */
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(to right, #c5c3e4, #e2dfff);
            z-index: 9999;
            transition: width 0.1s ease;
            box-shadow: 0 0 10px rgba(197, 195, 228, 0.5);
        }
        /* Cursor Orb */
        .cursor-orb {
            position: fixed;
            top: 0;
            left: 0;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(197, 195, 228, 0.15) 0%, rgba(197, 195, 228, 0) 70%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1;
            transition: width 0.3s, height 0.3s;
        }
        /* Reveal Animations */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
"""

html_code = """
<!-- Global Premium UI Elements -->
<div class="scroll-progress" id="scroll-progress"></div>
<div class="cursor-orb" id="cursor-orb"></div>
"""

js_code = """
        // 1. Scroll Progress Bar
        const scrollProgress = document.getElementById('scroll-progress');
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = (scrollTop / scrollHeight) * 100;
            if(scrollProgress) scrollProgress.style.width = scrollPercentage + '%';
        });

        // 2. Cursor Orb
        const cursorOrb = document.getElementById('cursor-orb');
        if (cursorOrb && !window.matchMedia("(max-width: 768px)").matches) {
            document.addEventListener('mousemove', (e) => {
                cursorOrb.style.left = e.clientX + 'px';
                cursorOrb.style.top = e.clientY + 'px';
            });
            document.addEventListener('mousedown', () => {
                cursorOrb.style.transform = 'translate(-50%, -50%) scale(0.8)';
                cursorOrb.style.background = 'radial-gradient(circle, rgba(197, 195, 228, 0.25) 0%, rgba(197, 195, 228, 0) 70%)';
            });
            document.addEventListener('mouseup', () => {
                cursorOrb.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOrb.style.background = 'radial-gradient(circle, rgba(197, 195, 228, 0.15) 0%, rgba(197, 195, 228, 0) 70%)';
            });
        }

        // 3. Scroll Reveal
        const revealElements = document.querySelectorAll('.reveal');
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));
"""

files = glob.glob('*.html')

for filepath in files:
    if filepath == 'index.html':
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    if 'cursor-orb' in content:
        continue # Already injected
        
    # Inject CSS before </style>
    content = content.replace('</style>', css_code + '\n</style>', 1)
    
    # Inject HTML after <body ...>
    body_match = re.search(r'<body[^>]*>', content)
    if body_match:
        content = content[:body_match.end()] + '\n' + html_code + content[body_match.end():]
        
    # Inject JS before last </script>
    script_match = list(re.finditer(r'</script>', content))
    if script_match:
        last_script = script_match[-1]
        content = content[:last_script.start()] + js_code + '\n' + content[last_script.start():]
        
    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Injected into {filepath}")

