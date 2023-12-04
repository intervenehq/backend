import $ky from "ky";
import { paths, components } from "./types/schema";
import { Simplify } from "type-fest";

export interface InterveneClientOptions {
  privateKey: string;
  host?: string;
}

type JobStatusResponse =
  paths["/v1/parser/{job_id}/status"]["get"]["responses"]["200"]["content"]["application/json"];
interface IdentifyJobStatusResponse extends Omit<JobStatusResponse, "result"> {
  result: components["schemas"]["parser_identify_result"];
}

interface ExecuteJobStatusResponse extends Omit<JobStatusResponse, "result"> {
  result: components["schemas"]["parser_execute_result"];
}

export class Intervene {
  private ky: typeof $ky;

  constructor(public options: InterveneClientOptions) {
    this.ky = $ky.create({
      prefixUrl: this.options.host ?? "https://api.intervene.run",
      headers: {
        Authorization: `Bearer ${this.options.privateKey}`,
      },
    });
  }

  async identify(
    params: paths["/v1/parser/identify"]["post"]["requestBody"]["content"]["application/json"]
  ) {
    const response = await this.ky.post("v1/parser/identify", {
      json: params,
    });

    return await response.json<
      paths["/v1/parser/identify"]["post"]["responses"]["200"]["content"]["application/json"]
    >();
  }

  async execute(
    params: Simplify<
      paths["/v1/parser/execute"]["post"]["requestBody"]["content"]["application/json"]
    >
  ) {
    const response = await this.ky.post("v1/parser/execute", {
      json: params,
    });

    return await response.json<
      paths["/v1/parser/execute"]["post"]["responses"]["200"]["content"]["application/json"]
    >();
  }

  async jobStatus(jobId: string) {
    const response = await this.ky.get(
      "v1/parser/{job_id}/status".replace("{job_id}", jobId)
    );

    return await response.json<
      paths["/v1/parser/{job_id}/status"]["get"]["responses"]["200"]["content"]["application/json"]
    >();
  }

  /**
   * Status for Identify API job.
   * Internally calls {@link jobStatus}
   */
  async identifyJobStatus(jobId: string) {
    const response = await this.jobStatus(jobId);

    return response as IdentifyJobStatusResponse;
  }

  /**
   * Status for Execute API job.
   * Internally calls {@link jobStatus}
   */
  async executeJobStatus(jobId: string) {
    const response = await this.jobStatus(jobId);

    return response as ExecuteJobStatusResponse;
  }

  /**
   * Delete a connection between a user and a provider.
   *
   * For example, if you want to delete a connection for an Oauth integration, the access tokens are deleted from Intervene.
   */
  async destroyConnection(provider: string, user_id: string) {
    const response = await this.ky.delete(
      "v1/integrations/{provider}/connections/{user_id}"
        .replace("{provider}", provider)
        .replace("{user_id}", user_id)
    );

    return await response.json<
      paths["/v1/integrations/{provider}/connections/{user_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
    >();
  }

  async generateHmacDigest(provider: string, user_id: string) {
    const response = await this.ky.post(
      "v1/integrations/{provider}/connections/{user_id}/hmac_digest"
        .replace("{provider}", provider)
        .replace("{user_id}", user_id)
    );

    return await response.text();
  }
}
