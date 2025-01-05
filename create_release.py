import os
import json
import zipfile
import subprocess
import requests

# Define selected folders
selected_folders = ['scripts', 'styles', 'assets', 'templates', 'languages', 'lang', 'packs', 'storage', 'icons']

def load_secrets():
    secrets_file_path = os.path.join(os.path.dirname(__file__), '..', 'SECRETS.json')

    try:
        with open(secrets_file_path, 'r') as secrets_file:
            secrets = json.load(secrets_file)
            return secrets
    except FileNotFoundError:
        print(f"SECRETS.json file not found at: {secrets_file_path}")
        return {}
    except json.JSONDecodeError:
        print(f"Error decoding JSON in SECRETS.json file at: {secrets_file_path}")
        return {}

def post_discord_webhook(embed_title, embed_description):

    # Create the payload for the webhook
    payload = {
        'embeds': [
            {
                'title': embed_title,
                'description': embed_description,
                'color': 0x3498db  # You can customize the color (hex) of the embed
            }
        ]
    }

    # Make an HTTP POST request to the webhook URL
    headers = {'Content-Type': 'application/json'}

    secrets = load_secrets()

    webhook_url = secrets.get('DISCORD_WEBHOOK_URL')

    response = requests.post(webhook_url, data=json.dumps(payload), headers=headers)

    # Check if the request was successful
    if response.status_code == 200 or response.status_code == 204:
        print("Webhook posted successfully.")
    else:
        print(f"Failed to post webhook. Status code: {response.status_code}")


def read_module_json():
    with open('module.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
        module_id = data['id']
        module_version = data['version']
        data['protected'] = True

    with open('module.json', 'w', encoding='utf-8') as file:
        # Save updated manifest data
        json.dump(data, file, indent=2, ensure_ascii=False)

    return module_id, module_version

def unset_protected():
    with open('module.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
        data['protected'] = False

    with open('module.json', 'w', encoding='utf-8') as file:
        # Save updated manifest data
        json.dump(data, file, indent=2, ensure_ascii=False)

def create_dist_folder():
    if not os.path.exists('dist'):
        os.makedirs('dist')

def add_folder_to_zip(zip_file, folder):
    if os.path.exists(folder):
        for root, dirs, files in os.walk(folder):
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, folder)
                zip_file.write(file_path, os.path.join(folder, relative_path))
    else:
        print(f"Warning: {folder} is missing. Skipping.")

def create_zip(module_id, module_version, folders):
    zip_filename = f'dist/{module_id}-{module_version}.zip'
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        files_to_zip = ['module.json', 'index.js', 'index.js.map']
        for file_to_zip in files_to_zip:
            if os.path.exists(file_to_zip):
                zip_file.write(file_to_zip)
            else:
                print(f"Warning: {file_to_zip} is missing. Skipping.")

        for folder in folders:
            add_folder_to_zip(zip_file, folder)

    print(f"Zip file '{zip_filename}' created successfully.")

def prompt_for_changelog():
    changes = []
    while True:
        entry = input("Enter changelog entry (or press Enter to finish): ")
        if entry == "":
            break
        else:
            changes.append(entry)
    return changes

def update_changelog_file(folder_path, id, version, changes):
    changelog_file_path = os.path.join(folder_path, f"{id}.md")

    # Create the file if not present
    if not os.path.exists(changelog_file_path):
        with open(changelog_file_path, 'w', encoding='utf-8') as file:
            file.write("")

    # Read existing content
    with open(changelog_file_path, 'r', encoding='utf-8') as file:
        existing_content = file.read()

    # Create the new changelog in markdown format
    new_changelog = f"## Version {version}\n"
    new_changelog += "\n".join([f"- {change}" for change in changes])
    new_changelog += "\n\n" + existing_content

    # Write back to the file
    with open(changelog_file_path, 'w', encoding='utf-8') as file:
        file.write(new_changelog)

def commit_and_push_changes(git_folder_path, commit_message):
    os.chdir(git_folder_path)
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", commit_message])
    subprocess.run(["git", "push"])

def create_changelog():
    # Prompt for changelog entries
    changes = prompt_for_changelog()

    # Read manifest.json in the current folder
    with open("module.json", 'r', encoding='utf-8') as manifest_file:
        manifest_data = json.load(manifest_file)
        id = manifest_data["id"]
        version = manifest_data["version"]
        title = manifest_data["title"]

    # Go back one folder
    parent_folder_path = os.path.abspath(os.path.join(os.getcwd(), os.pardir))

    # Navigate to "theripper-premium-hub/premium-changelogs"
    changelog_folder_path = os.path.join(parent_folder_path, "theripper-premium-hub", "premium-changelogs")

    # Update the changelog file
    update_changelog_file(changelog_folder_path, id, version, changes)

    # Commit and push changes to GitHub
    git_folder_path = os.path.join(parent_folder_path, "theripper-premium-hub")
    commit_message = f"Update changelog for {id} version {version}"
    commit_and_push_changes(git_folder_path, commit_message)

    # Create the embed title and description
    embed_title = f"{title} - Version {version}"
    
    # Include the Package Page link in the description
    package_page_link = f"\n**Package Page**\n https://foundryvtt.com/packages/{id}"
    embed_description = "\n".join([f"- {change}" for change in changes] + [package_page_link])

    # Post Discord Embed Webhook
    post_discord_webhook(embed_title, embed_description)

    print("Changelog updated and webhook posted successfully.")


def main():
    module_id, module_version = read_module_json()
    create_dist_folder()

    create_zip(module_id, module_version, selected_folders)
    
    unset_protected()

    create_changelog()

if __name__ == "__main__":
    main()