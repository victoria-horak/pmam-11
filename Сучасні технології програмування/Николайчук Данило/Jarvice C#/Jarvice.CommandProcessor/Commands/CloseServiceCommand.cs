using Jarvice.CommandProcessor.Interfaces;

namespace Jarvice.CommandProcessor.Commands;

public class CloseServiceCommand : ICommand
{
	private readonly IFileWorkerService _fileWorkerService;
	private readonly string _serviceName;
	private readonly string _servicePath;

	public string Name => _serviceName;

	public CloseServiceCommand(string serviceName, string servicePath, IFileWorkerService fileWorkerService)
	{
		_serviceName = serviceName;
		_servicePath = servicePath;
		_fileWorkerService = fileWorkerService;
	}

	public Task ExecuteAsync()
	{
		_fileWorkerService.CloseFile(_servicePath);
		return Task.CompletedTask;
	}
}
