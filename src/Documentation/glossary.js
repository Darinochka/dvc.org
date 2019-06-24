export default {
  name: 'Glossary',
  desc:
    'This guide is aimed to familiarize the users with definitions to ' +
    'relevant DVC concepts and terminologies which are frequently used.',
  contents: [
    {
      name: 'Workspace directory',
      match: ['workspace'],
      desc:
        'Also abbreviated as workspace, it is the root directory of a ' +
        'project where DVC is initialized by running `dvc init` command. ' +
        'Therefore, this directory will contain a `.dvc` directory as well.'
    },
    {
      name: 'Cache directory',
      match: ['cache'],
      desc:
        'DVC cache is a hidden storage which is found at `.dvc/cache`. This ' +
        'storage is used to manage different versions of files which are ' +
        'under DVC control. For more information on cache, please refer to ' +
        'the this [guide](/doc/commands-reference/config#cache).'
    }
  ]
}
