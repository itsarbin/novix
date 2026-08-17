import { k8sCoreV1Api } from "./config.js";

export async function createService(sandboxId) {
  const serviceManifest = {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: `sandbox-service-${sandboxId}`,
      labels: {
        app: "sandbox-service",
        sandboxId: sandboxId,
      },
    },
    spec: {
      selector: {
        app: "sandbox-pod",
        sandboxId: sandboxId,
      },
      ports: [
        {
          name: "http",
          port: 80,
          targetPort: 5173,
          protocol: "TCP",
        },
        {
          name: "agent-http",
          port: 3000,
          targetPort:3000,
          protocol: "TCP",
        }
      ],
      type: "ClusterIP",
    },
  };

  const response = await k8sCoreV1Api.createNamespacedService({
    namespace: "default",
    body: serviceManifest,
  });

  return response;
}

export const deleteService = async (sandboxId) => {
  try {
    const response = await k8sCoreV1Api.deleteNamespacedService({
      namespace: "default",
      name: `sandbox-service-${sandboxId}`,
    });
    return response;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};