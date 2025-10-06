# Contributing to Inquizzitive 🎉

Thanks for showing interest in contributing to **Inquizzitive**! 💡 We welcome all contributors, especially for **Hacktoberfest**. Whether you want to fix bugs, improve design, add features, or enhance documentation — your contribution matters! 🙌

## 📌 How to Contribute

### 1. Check Issues
* Look at the **Issues** tab of this repository.
* Pick any issue labeled `hacktoberfest`, `good first issue`, or `enhancement`.
* You can also propose your own improvements by creating a new issue.

### 2. Fork the Repository
* Click the **Fork** button at the top right of this repo.
* Clone your fork locally:

```bash
git clone git@github-sbdecoder:sb-decoder/inquizzitive.git
cd inquizzitive
```

### 3. Create a New Branch
* Always create a separate branch for your work:

```bash
git checkout -b feature/your-feature-name
```

### 4. Set Up Environment Variables
* If the project uses the Gemini API, you'll need to get an API key:
  * Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
  * Sign in with your Google account
  * Click on **"Get API Key"** or **"Create API Key"**
  * Copy your API key and add it to your `.env` file:
    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```
* Make sure to **never commit your `.env` file** to the repository.

### 5. Test Your Changes
* Work on code, UI, docs, or any improvement.
* If you are fixing a bug or issue, **reference the issue number** in your commit message.

### 6. Test Your Changes Locally
* Make sure the project runs without errors:

```bash
npm install
# Two separate terminal one for client one for server
npm run client
npm run server
```

### 7. Test Your Changes in Production environment
* Make sure the project runs without errors:
- Note: It will automatically stops
```bash
npm install
npm run start
```

### 8. Commit and Push

```bash
git add .
npm run prepare
git commit -m "✨ Added new feature: description (fixes #issue_number)"
git push origin feature/your-feature-name
```

### 9. Open a Pull Request
* Go to your fork on GitHub.
* You'll see a **Compare & Pull Request** button. Click it.
* Provide details about what you changed and why.
* Wait for review and feedback.

## ✅ Contribution Guidelines

* Write **clear commit messages**.
* Keep PRs **small and focused** on one feature/fix.
* Follow project's coding style (React + CSS).
* Update documentation if your change requires it.
* Be respectful and collaborative with maintainers and other contributors.

## 💡 What You Can Work On

* Fix open issues in the repository.
* Improve UI/UX (Glassmorphism, navbar, homepage, etc.).
* Add more quiz categories or difficulty levels.
* Write better documentation.
* Improve performance or code readability.

## 🎯 Hacktoberfest Notes

* Make **quality contributions**. Spam PRs will be marked as **invalid** 🚫.
* Each accepted PR counts toward your Hacktoberfest goals.
* Don't hesitate to ask for clarifications in issues before starting work.

## 🙌 Need Help?

* Open a discussion or ask in issues.
* Maintainers will be happy to help you get started.

---

**Happy contributing & Happy Hacktoberfest!** 🎃✨
