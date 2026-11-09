import os
import zipfile

EXCLUDE_DIRS = {'node_modules', '.git', 'dist', '.firebase', '__pycache__'}
EXCLUDE_EXTS = {'.log'}
EXCLUDE_FILES = {'deploy.zip', 'make-zip.py'}

def create_deploy_zip():
    zip_path = 'deploy.zip'
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
            for f in files:
                if f in EXCLUDE_FILES or any(f.endswith(ext) for ext in EXCLUDE_EXTS):
                    continue
                full_path = os.path.join(root, f)
                # Force standard UNIX forward-slashes for Cloud Build / Linux compatibility
                arcname = os.path.relpath(full_path, '.').replace(os.sep, '/')
                z.write(full_path, arcname)

    print(f"Deploy archive successfully created: {zip_path} ({len(z.namelist())} files, 100% POSIX format)")

if __name__ == '__main__':
    create_deploy_zip()

