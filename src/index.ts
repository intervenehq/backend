import axios from "axios";
import { paths, components } from "../types/schema";

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
  constructor(public options: InterveneClientOptions) {
    axios.defaults.headers["Authorization"] =
      `Bearer ${this.options.privateKey}`;
    axios.defaults.baseURL = this.options.host ?? "https://api.intervene.run";
  }

  async identity(params: paths["/v1/parser/identify"]["post"]["requestBody"]) {
    const response = await axios.post<
      paths["/v1/parser/identify"]["post"]["responses"]["200"]["content"]["application/json"]
    >("/v1/parser/identify", params);

    return response.data;
  }

  async execute(params: paths["/v1/parser/execute"]["post"]["requestBody"]) {
    const response = await axios.post<
      paths["/v1/parser/execute"]["post"]["responses"]["200"]["content"]["application/json"]
    >("/v1/parser/execute", params);

    return response.data;
  }

  async jobStatus(jobId: string) {
    const response = await axios.post<
      paths["/v1/parser/{job_id}/status"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/v1/parser/{job_id}/status".replace("{job_id}", jobId));

    return response.data;
  }

  async identifyJobStatus(jobId: string) {
    const response = await this.jobStatus(jobId);

    return response as IdentifyJobStatusResponse;
  }

  async executeJobStatus(jobId: string) {
    const response = await this.jobStatus(jobId);

    return response as ExecuteJobStatusResponse;
  }

  async destroyConnection(provider: string, user_id: string) {
    const response = await axios.delete<
      paths["/v1/integrations/{provider}/connections/{user_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
    >(
      "/v1/integrations/{provider}/connections/{user_id}"
        .replace("{provider}", provider)
        .replace("{user_id}", user_id)
    );

    return response.data;
  }
}
