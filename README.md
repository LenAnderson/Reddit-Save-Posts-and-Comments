# Reddit-Save-Posts-and-Comments
Save reddit posts and comments in a GitHub Gist. This way you can still read them after they have been deleted.

## Installation
You need to have a UserScript extension (e.g. Tampermonkey for Chrome, Greasemonkey for Firefox) installed to run this script.

  1. If you don't have an account on GitHub you need to create one.
  1. Create a Gist at https://gist.github.com (can be a secret gist). You will have to add one file with some content. Name and content don't matter, this file will be ignored by the UserScript.
  1. [Install this UserScript](https://github.com/LenAnderson/Reddit-Save-Posts-and-Comments/raw/master/reddit_save_posts_and_comments.user.js).
  1. To configure the UserScript go to the reddit [preferences](https://www.reddit.com/prefs/save-in-gist/). You have to provide your GitHub username and password, and the Gist's ID. **These values will be stored unencrypted in your browser's localStorage so you might not want to use your main GitHub account for this.** I am open to suggestions on how to better handle this.
