#!/bin/sh

set -x

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_new_version() {
  git clone --depth=500 https://${GH_TOKEN}@github.com/$TRAVIS_REPO_SLUG $TRAVIS_REPO_SLUG
  
  # Update application info
  cd $TRAVIS_REPO_SLUG
  npm install
  npm run update-app-info
  git add -f app/package.json
  git add -f app/package-lock.json
  git add -f snap/snapcraft.yaml
  git commit -m "Travis update application info ($TRAVIS_BUILD_NUMBER)" -m "[skip ci]"

  # Update application version
  cd app
  newVersion=$(git describe --abbrev=0)
  npm version $newVersion
  npm install
  # Current month and year, e.g: Apr 2018
  dateAndMonth=`date "+%b %Y"`
  # Stage the modified files in dist/output
  git add -f package.json
  git add -f package-lock.json
  # Create a new commit with a custom build message
  # with "[skip ci]" to avoid a build loop
  # and Travis build number for reference
  git commit -m "Travis update version $newVersion ($TRAVIS_BUILD_NUMBER)" -m "[skip ci]"
}

upload_files() {
  # Add new "origin" with access token in the git URL for authentication
  git push https://${GH_TOKEN}@github.com/$TRAVIS_REPO_SLUG master > /dev/null 2>&1
}

setup_git

commit_new_version

# Attempt to commit to git only if "git commit" succeeded
if [ $? -eq 0 ]; then
  echo "A new commit with new version. Uploading to GitHub"
  upload_files
else
  echo "Cannot commit new version"
fi