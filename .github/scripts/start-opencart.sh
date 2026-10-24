#!/usr/bin/env bash
# Provisions a disposable OpenCart store for the test run on a GitHub-hosted Ubuntu runner
# (PHP and MySQL are preinstalled there). demo.opencart.com sits behind a Cloudflare bot check that
# blocks automated browsers from CI, so pipelines test against this store unless TARGET=demo is chosen.
#
# Usage: start-opencart.sh [version] [port]
set -euo pipefail

OC_VERSION="${1:-4.1.0.4}"
PORT="${2:-8080}"
OC_DIR="${RUNNER_TEMP:-/tmp}/opencart"
DB_NAME=opencart
DB_USER=oc
DB_PASS=ocpass

echo "::group::Start MySQL"
sudo systemctl start mysql.service
for _ in $(seq 1 30); do mysqladmin -uroot -proot ping >/dev/null 2>&1 && break; sleep 1; done
mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4;
  CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
  GRANT ALL ON ${DB_NAME}.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;"
echo "::endgroup::"

echo "::group::Install OpenCart ${OC_VERSION}"
rm -rf "${OC_DIR}" "${RUNNER_TEMP:-/tmp}/opencart-src"
git clone --quiet --depth 1 --branch "${OC_VERSION}" https://github.com/opencart/opencart.git "${RUNNER_TEMP:-/tmp}/opencart-src"
cp -r "${RUNNER_TEMP:-/tmp}/opencart-src/upload" "${OC_DIR}"
cp "${OC_DIR}/config-dist.php" "${OC_DIR}/config.php"
cp "${OC_DIR}/admin/config-dist.php" "${OC_DIR}/admin/config.php"
(cd "${OC_DIR}/install" && php cli_install.php install \
  --username admin --password 'Admin@12345' --email admin@example.com \
  --http_server "http://localhost:${PORT}/" --language en-gb \
  --db_driver mysqli --db_hostname localhost --db_username "${DB_USER}" --db_password "${DB_PASS}" \
  --db_database "${DB_NAME}" --db_port 3306 --db_prefix oc_)
# Match demo.opencart.com: customers must accept "Terms & Conditions" (information_id 2) at checkout.
mysql -u"${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" -e "UPDATE oc_setting SET value='2' WHERE \`key\`='config_checkout_id';"
echo "::endgroup::"

echo "::group::Serve on http://localhost:${PORT}"
PHP_CLI_SERVER_WORKERS=8 nohup php -S "0.0.0.0:${PORT}" -t "${OC_DIR}" > "${RUNNER_TEMP:-/tmp}/opencart-server.log" 2>&1 &
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://localhost:${PORT}/index.php?route=common/home&language=en-gb"; then
    echo "OpenCart ${OC_VERSION} is up"; echo "::endgroup::"; exit 0
  fi
  sleep 1
done
echo "::error::OpenCart did not start"; cat "${RUNNER_TEMP:-/tmp}/opencart-server.log"; exit 1
