namespace Jarvice.CommandProcessor.Interfaces;

public interface IDockerWorkerService
{
	void RestartServices(string powerShellScriptPath);
	Task ReloadServicesAsync(string powerShellScriptToLoadNew, string powerShellScripToStart);
}
