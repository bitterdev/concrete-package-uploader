# Concrete Package Uploader

A GitHub Action to automate the upload of Concrete CMS package ZIP files to the Concrete CMS Marketplace. This action simplifies release workflows by enabling seamless, automated updates to your package versions without manual intervention.

> **Note**: This action only works for add-ons that have already been submitted to the Concrete CMS Marketplace.

## Features

- Uploads Concrete CMS package ZIP files to the Marketplace.
- Automatically retrieves version number and changelog from the package if not provided.
- Supports secure handling of credentials via GitHub Secrets.

## Inputs

| Name          | Description                                      | Required |
|---------------|--------------------------------------------------|----------|
| `uuid`        | Your ConcreteCMS.com marketplace item UUID       | Yes      |
| `username`    | Your ConcreteCMS.com username                    | Yes      |
| `password`    | Your ConcreteCMS.com password                    | Yes      |
| `packageFile` | Path to the local ZIP package file               | Yes      |
| `versionNumber` | Version number of the package                  | No       |
| `changelog`   | Changelog of the package                        | No       |

## Example Usage

```yaml
name: Upload Concrete CMS Package
on:
  release:
    types: [published]

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Upload Concrete CMS Package
        uses: your-username/concrete-package-uploader@v1
        with:
          uuid: ${{ secrets.CONCRETE_PRODUCT_UUID }}
          username: ${{ secrets.CONCRETE_USERNAME }}
          password: ${{ secrets.CONCRETE_PASSWORD }}
          packageFile: 'dist/my_package.zip'
```

### Notes

- The `uuid` can be found in the product URL of the Marketplace item.
- If `versionNumber` is not provided, the version number is retrieved from the `controller.php` file in the ZIP archive.
- If `changelog` is not provided, the changelog is retrieved from the `CHANGELOG` file in the ZIP archive.
- A valid `CHANGELOG` file must follow the format shown in this [example](https://github.com/bitterdev/web_authn/blob/main/CHANGELOG) and be included in the package ZIP to be automatically detected.

## Developer Notes

To build and deploy the action:

```bash
npm install -g @vercel/ncc
ncc build index.js -o dist
git tag v1.0.0
git push origin v1.0.0 -f
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.txt) file for details.
