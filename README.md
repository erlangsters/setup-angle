# Setup ANGLE

This repository contains a JavaScript action to setup ANGLE in your Github
Actions workflows. It detects the platform of your runners and install a
pre-built branch of ANGLE accordingly.

```yaml
- uses: erlangsters/setup-angle@v1
  with:
    angle-branch: chromium/5615
```

Note that ANGLE identifies releases by "branch" rather than "version".
Additionally, because ANGLE is not needed on Linux, this action supports only
macOS and Windows.

> The pre-built binaries used by this action are the ones maintained by the
> Erlangsters community. See the
> [ANGLE builder](https://github.com/erlangsters/build-angle) for more
> information.

Written by the Erlangsters [community](https://about.erlangsters.org/) and
released under the MIT [license](/https://opensource.org/license/mit).

XXX: Write the ANGLE builder. Manual builds were used for the time being.

XXX: Fix the branch/commit temporary workaround.

## Basic usage

No input is required to use this action and therefore the most basic usage is
the following.

```yaml
- uses: erlangsters/setup-angle@v1
```

It will simply use the most recent available branch of ANGLE and install just
that.

Of course, you may specify a given branch with the `branch` input field.

```yaml
- uses: erlangsters/setup-angle@v1
  with:
    angle-branch: fdff117
```

In this example, the action will attempt to install the `fdff117` branch. If
that branch is not available, the workflow will fail.

The action provides two outputs:

- `angle-branch` – The ANGLE branch that was actually installed.
- `angle-location` – The absolute path to the ANGLE installation directory, which contains the `include/` and `lib/` folders (and `bin/` on Windows for the DLLs).

You can use these outputs in subsequent workflow steps to reference the
installed ANGLE files as needed.

## Available branches

> [!NOTE]
> Temporarily, instead of "branch name", it uses commit hash. Later, it will
> look like `chromium/7285`. I don't know which branch commit `fdff117`
> corresponds to, however, it's commit pushed in July 2025.

The available ANGLE branches are:

- `fdff117`

For now, only one build of ANGLE is available.

## Typical example

This Github action was primarly developped to easily compile (and distribute)
Erlang and Elixir based applications that use the [EGL binding](https://github.com/erlangsters/egl-1.5) and one of the
[OpenGL bindings]((https://github.com/orgs/erlangsters/repositories?type=all&q=opengl-)).

Here is how it's meant to be typically used in your workflows.

```yaml
- id: angle
  uses: erlangsters/setup-angle@v1
- run: |
    export ANGLE_INCLUDE_DIR="${{ steps.angle.outputs.angle-location }}/include"
    export ANGLE_LIB_DIR="${{ steps.angle.outputs.angle-location }}/lib"
    rebar3 compile
```

XXX: Shows how it works on Windows once finalized.

It reads the location of the installed pre-built branch of ANGLE and sets up
the environment variables needed by the build system.
