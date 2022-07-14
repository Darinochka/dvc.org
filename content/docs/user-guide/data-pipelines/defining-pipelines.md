# Defining Pipelines

DVC helps codify such workflows so that you or anyone can reliably **reproduce**
them later. This way you can ensure that steps are followed when necessary (and
only when necessary).

Pipelines are defined as a set of `stages` in
[`dvc.yaml` metafiles](#dvcyaml-metafiles).

## Stages

A pipeline is a collection of data processing stages related to one another.
Stages wrap around an executable shell command and specify its inputs and
outputs (if any).

Stage execution order is determined by defining outputs that feed into
subsequent stage inputs, e.g. if an output of stage X is used as an input in
stage Y, then DVC deduces that X should be run before Y. Technically, this is
called a _dependency graph_ (specifically a
[DAG](#directed-acyclic-graph-dag-click-to-learn-more)).

<details>

### Click to learn more about **directed acyclic graphs** (DAG)

Internally, DVC represents the pipeline as a graph where the nodes are stages
and the edges are _directed_ dependencies (e.g. B requires A). In order for DVC
to execute the pipeline reliably, the graph should be _acyclic_ -- because
executing cycles (e.g. A -> B -> C -> A ...) would continue indefinitely. Use
`dvc dag` to visualize/export pipeline DAGs.

[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph

</details>

<admon type="info">

Note that the order of execution is entirely based on the DAG, and not on the
order in which stages are found in `dvc.yaml`.

</admon>

## `dvc.yaml` metafiles

There are two ways to define <abbr>stages</abbr>. The first and recommended
method is by writing `dvc.yaml` files directly (`stages` list). The other one is
via `dvc stage add`, a limited command-line interface to stage setup.

Let's look at a sample `preprocess` stage that runs command
`python src/preprocess.py`. It depends on the corresponding Python script and on
a raw data file (ideally already [tracked with DVC]).

```yaml
stages:
  preprocess:
    cmd: python src/preprocess.py
    deps:
      - data/raw
      - src/preprocess.py
    outs:
      - data/preprocessed
```

<admon type="info">

We use [GNU/Linux](https://www.gnu.org/software/software.html) in our examples,
but Windows or other shells can be used too. Note that while DVC is
platform-agnostic, the commands you define may have environment-specific
requirements.

</admon>

You can write the `dvc.yaml` file above directly, or DVC can do it with the
following call:

```dvc
$ dvc stage add --name preprocess \
                --deps src/preprocess.py \
                --deps data/raw \
                --outs data/preprocessed \
                python src/preprocess.py
```

<admon type="tip">

One advantage of using `dvc stage add` is that it will verify the validity of
the arguments provided (otherwise they won't be checked until execution). A
disadvantage is that advanced pipelining features such as [templating] are not
always available this way.

</admon>

[tracked with dvc]: /doc/start/data-management
[templating]: /doc/user-guide/project-structure/pipelines-files#templating

DVC writes lock files (`dvc.lock`) to complement `dvc.yaml` operations.
Versioning both files with Git brings your pipelining process onto standard Git
workflows.

<details>

### `dvc.lock` files: click to learn more.

<admon type="info">

You should never need to see the contents `dvc.lock` for regular DVC work.

</admon>

Lock files help DVC fix the state of the pipeline as it was last executed in
order to compare it against the current state of the <abbr>workspace</abbr>. The
following sample shows the kind of details saved.

```yaml
schema: '2.0'
stages:
  preprocess:
    cmd: src/preprocess.py
    deps:
      - path: data/raw
        md5: 687552951726b99c2eee15d29b4ccf0e
        size: 17397976
      - path: src/preprocess.py
        md5: 51627ab6d865c51a634959dbc4914d24
        size: 14623
    outs:
      - path: data/preprocessed
        md5: 21188b73b5661d4730d769f795462485.dir
        size: 154683
        nfiles: 312
```

</details>

## Simple dependencies

There's more than one type of stage dependency: A simple dependency is a file or
directory needed for the stage `cmd` to run successfully. When it's contents
have changed, DVC "invalidates" the stage -- it knows that it needs to run
again.

<admon type="info">

DVC [calculates a hash] of file/dir contents to compare vs. previous versions.
This is a distinctive mechanism over traditional build tools like `make`.

[calculates a hash]:
  /doc/user-guide/project-structure/internal-files#structure-of-the-cache-directory

</admon>

File system-level dependencies are defined in the `deps` list of `dvc.yaml`;
Alternatively, using the `--deps` (`-d`) option of `dvc stage add` (see the
previous section's example).

<details>

### External dependencies: click to learn more.

A less common kind of dependency is a _URL dependency_. Instead of files in a
local disk, you can `dvc import-url` data from outside the
<abbr>workspace</abbr> (even remote locations). These establish relationships
between different projects and systems.
[Get all the details](/doc/user-guide/external-dependencies).

<admon type="info">

DVC will use special methods to check whether the contents of an URL have
changed for the purpose of stage invalidation.

</admon>

</details>

## Parameter dependencies

A more ML-specific type of dependency is the _hyperparameter_ (`params` field).
These are simple values used inside your code to tune data processing, modeling
attributes, or that determine stage execution in any other way. For example, a
[random forest classifier] may require a _maximum depth_ value.

Instead of hard-coding it, your code can read param values from a parameters
file. `dvc params` can track any key/value pair inside structured YAML, JSON,
TOML, or Python files (see also `dvc.api.params_show()`). DVC will keep track of
params as granular dependencies: it will only invalidate the stage if that part
of the file has changed.

Parameters are defined under the `params` set of `dvc.yaml`. Each entry is the
key string to look for the param value in the default params file, `params.yaml.
Sub-list under custom params file names can also be included.

```yaml
stages:
  featurize:
    cmd: ...
    ...
    params:
      - learning_rate  # from params.yaml
      - deep_learning.json:
          - epochs     # from custom deep_learning.json file
```

[random forest classifier]:
  https://medium.com/all-things-ai/in-depth-parameter-tuning-for-random-forest-d67bb7e920d