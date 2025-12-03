using Jarvice.CommandProcessor.Configurations;
using Jarvice.CommandProcessor.Interfaces;
using Microsoft.Extensions.Options;

namespace Jarvice.CommandProcessor.Commands;

public class RestartDockerServicesCommand : ICommand
{
	private readonly IDockerWorkerService _dockerWorkerService;
	private readonly string _scriptPath;

	public string Name => "restart docker services";

	public RestartDockerServicesCommand(IDockerWorkerService dockerWorkerService,
		IOptions<DockerScripts> options)
	{
		_dockerWorkerService = dockerWorkerService;
		_scriptPath = options.Value.UpServices;
	}

	public Task ExecuteAsync()
	{
		_dockerWorkerService.RestartServices(_scriptPath);
		return Task.CompletedTask;
	}
}