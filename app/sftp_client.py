import paramiko
from scp import SCPClient
 
# Shared state
state = {
    "ssh_client": None,
    "sftp": None,
    "scp": None,
    "remote_path": None,
    "protocol": None
}
 
def connect_and_cache(host, username, password, remote_path, protocol):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname=host, username=username, password=password)
 
    state["ssh_client"] = ssh
    state["remote_path"] = remote_path
    state["protocol"] = protocol.lower()
 
    if state["protocol"] == "sftp":
        state["sftp"] = ssh.open_sftp()
    elif state["protocol"] == "scp":
        state["scp"] = SCPClient(ssh.get_transport())
    else:
        raise ValueError("Unsupported protocol")
 
def is_connected():
    return state["ssh_client"] is not None
 
def list_files():
    if state["protocol"] == "sftp":
        return state["sftp"].listdir(state["remote_path"])
    elif state["protocol"] == "scp":
        raise NotImplementedError("SCP does not support file listing")
    else:
        raise RuntimeError("Invalid protocol")
 
def upload_file(local_path, filename):
    remote_path = f"{state['remote_path']}/{filename}"
    if state["protocol"] == "sftp":
        state["sftp"].put(local_path, remote_path)
    elif state["protocol"] == "scp":
        state["scp"].put(local_path, remote_path)
    else:
        raise RuntimeError("Invalid protocol")
    return remote_path
 
def download_file(filename, local_path):
    remote_path = f"{state['remote_path']}/{filename}"
    if state["protocol"] == "sftp":
        state["sftp"].get(remote_path, local_path)
    elif state["protocol"] == "scp":
        state["scp"].get(remote_path, local_path)
    else:
        raise RuntimeError("Invalid protocol")
 
def delete_file(filename):
    remote_path = f"{state['remote_path']}/{filename}"
    if state["protocol"] == "sftp":
        state["sftp"].remove(remote_path)
    elif state["protocol"] == "scp":
        raise NotImplementedError("SCP does not support file deletion")
    else:
        raise RuntimeError("Invalid protocol")
    return remote_path
 
def close_connection():
    if state["sftp"]:
        state["sftp"].close()
    if state["scp"]:
        state["scp"].close()
    if state["ssh_client"]:
        state["ssh_client"].close()
    # Reset state
    for key in state:
        state[key] = None