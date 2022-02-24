/* eslint-disable */

const makeTranslationFileContents = ( repo, translation ) => {
  return {
    hi: `repo is ${repo}, sim is ${translation.simName}`
  };
};

export default makeTranslationFileContents;