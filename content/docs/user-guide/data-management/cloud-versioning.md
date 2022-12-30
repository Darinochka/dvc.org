# Cloud Versioning

<admon type="warn">

Cloud versioning features are currently under active development and should be
considered experimental. These features are subject to frequent change, and the
documentation may not always reflect changes available in the latest DVC
release.

</admon>

When cloud versioning is enabled, DVC will store files in the remote according
to their original directory location and filenames. Different versions of a file
will then be stored as separate versions of the corresponding object in cloud
storage. This is useful for cases where users prefer to retain their original
filenames and directory hierarchy in remote storage (instead of using DVC's
usual
[content-addressable storage](/doc/user-guide/project-structure/internal-files#structure-of-the-cache-directory)
format).

<admon type="warn">

Note that not all DVC functionality is supported when using cloud versioned
remotes, and using cloud versioning comes with the tradeoff of losing certain
benefits of content-addressable storage.

</admon>

<details>

### Expand for more details on the differences between cloud versioned and content-addressable storage

`dvc remote` storage normally uses
[content-addressable storage](/doc/user-guide/project-structure/internal-files#structure-of-the-cache-directory)
to organize versioned data. Different versions of files are stored in the remote
according to hash of their data content instead of according to their original
filenames and directory location. This allows DVC to optimize certain remote
storage lookup and data sync operations, and provides data de-duplication at the
file level. However, this comes with the drawback of losing human-readable
filenames without the use of the DVC CLI (`dvc get --show-url`) or API
(`dvc.api.get_url()`).

When using cloud versioning, DVC does not provide de-duplication, and certain
remote storage performance optimizations will be unavailable.

</details>

## Supported storage providers

Cloud versioning features are only avaible for certain storage providers.
Currently, it is supported on the following `dvc remote` types:

- Amazon S3 (requires
  [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
  enabled buckets)
- Microsoft Azure Blob Storage (requires
  [Blob versioning](https://learn.microsoft.com/en-us/azure/storage/blobs/versioning-overview)
  enabled storage accounts and containers)
- Google Cloud Storage (requires
  [Object versioning](https://cloud.google.com/storage/docs/object-versioning)
  enabled buckets)

## Version-aware remotes

When the `version_aware` option is enabled on a `dvc remote`:

- `dvc push` will utilize cloud versioning when storing data in the remote. Data
  will retain its original directory structure and filenames, and each version
  of a file tracked by DVC will be stored as a new version of the corresponding
  object in cloud storage.
- `dvc fetch` and `dvc pull` will download the corresponding version of an
  object from cloud storage.

<admon type="warn">

Note that when `version_aware` is in use, DVC does not delete current versions
or restore noncurrent versions of objects in cloud storage. So the current
version of an object in cloud storage may not match the version of a file in your DVC repository.

</admon>

## Worktree remotes

`worktree` remotes behave similarly to `version_aware` remotes, but with one key
difference. For `worktree` remotes, DVC will also attempt to ensure that the
current version of objects in cloud storage match the latest versions of files
in your DVC repository.

So in addition to the command behaviors described for `version_aware` remotes,
when the `worktree` option is enabled on a `dvc remote`:

- `dvc push` will also ensure that the current version of objects in remote
  storage match the latest versions of files in your DVC repository repository.
  Additionally, DVC will delete the current version of any objects which were
  present in cloud storage but that do not exist in your current DVC repository
  workspace.
- `dvc update` can be used to update a DVC-tracked file or directory in your DVC
  repository to match the current version of the corresponding object(s) from
  cloud storage.

<admon type="info">

Note that deleting current versions in cloud storage does not delete any objects
(and does not delete any data). It only means that the current version of a
given object will show that the object does not exist.

</admon>

## Importing versioned data

DVC supports importing cloud versioned data from supported storage providers.
Refer to the documentation for `dvc import-url` and `dvc update` for more
information.