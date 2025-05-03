# concrete-package-uploader

This GitHub Action automates the upload of Concrete CMS package ZIP files to the Concrete CMS Marketplace. It is intended for use in release workflows to keep your package versions up to date without manual intervention.

## Inputs

| Name         | Description                                   | Required |
|--------------|-----------------------------------------------|----------|
| username     | Your ConcreteCMS.org username                 | Yes      |
| password     | Your ConcreteCMS.org API password or token    | Yes      |
| packageFile  | Path to the local ZIP package file            | Yes      |

## Example Usage

```yaml
- name: Upload Concrete CMS Package
  uses: your-username/concrete-package-uploader@v1
  with:
    username: ${{ secrets.CONCRETE_USERNAME }}
    password: ${{ secrets.CONCRETE_PASSWORD }}
    packageFile: 'dist/my_package.zip'

