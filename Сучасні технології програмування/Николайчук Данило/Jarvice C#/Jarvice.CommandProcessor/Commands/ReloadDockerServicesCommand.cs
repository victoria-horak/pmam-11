using Jarvice.CommandProcessor.Configurations;
using Jarvice.CommandProcessor.Interfaces;
using Microsoft.Extensions.Options;

namespace Jarvice.CommandProcessor.Commands;

public class ReloadDockerServicesCommand : ICommand
{
	private readonly IDockerWorkerService _dockerWorkerService;
	private readonly DockerScripts _dockerScripts;

	public string Name => "reload docker services";

	public ReloadDockerServicesCommand(IDockerWorkerService dockerWorkerService,
		IOptions<DockerScripts> options)
	{
		_dockerWorkerService = dockerWorkerService;
		_dockerScripts = options.Value;
	}

	public async Task ExecuteAsync()
	{
		await _dockerWorkerService.ReloadServicesAsync(_dockerScripts.LoadServices, _dockerScripts.UpServices);
	}
}
