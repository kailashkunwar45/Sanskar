import { httpRequest } from "../../../services/http/client";

export function checkApiHealth() {
  return httpRequest("/api/health");
}
