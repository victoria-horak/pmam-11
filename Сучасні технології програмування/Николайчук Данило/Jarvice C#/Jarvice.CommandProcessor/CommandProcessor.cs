using Jarvice.CommandProcessor.Interfaces;

namespace Jarvice.CommandProcessor;

public class CommandProcessor : ICommandProcessor
{
	private readonly ICommandFactory _factory;

	public CommandProcessor(ICommandFactory factory)
	{
		_factory = factory;
	}

	public async Task ProcessCommand(string text)
	{
		if (_factory.TryGetCommand(text, out var command))
			await command.ExecuteAsync();
		else
			Console.WriteLine($"Unknown command: {text}");
	}
}
